package main

import (
    "fmt"
    "log"
    "time"
    "bytes"
    "encoding/json"
    "net/http"
    "strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"metronic/internal/config"
	"metronic/internal/database"
	"metronic/internal/domain"
	"metronic/internal/handler"
	"metronic/internal/repository"
	route "metronic/internal/route"
	"metronic/internal/service"
)

func main() {
    cfg := config.Load()

    db, err := database.Connect(cfg.DBDSN)
    if err != nil {
        log.Fatalf("db connect: %v", err)
    }

    // Seed default roles and demo users
    if err := database.Seed(db); err != nil {
        log.Fatalf("db seed: %v", err)
    }

    userRepo := repository.NewUserRepository(db)
    tokenRepo := repository.NewTokenRepository(db)
    shopRepo := repository.NewShopRepository(db)
    shopRenewalRepo := repository.NewShopRenewalRepository(db)
    customerRepo := repository.NewCustomerRepository(db)

    authService := service.NewAuthService(userRepo, tokenRepo)
    authHandler := handler.NewAuthHandler(authService)
    userService := service.NewUserService(userRepo)
    userHandler := handler.NewUserHandler(userService)
    shopService := service.NewShopService(shopRepo).WithRenewalRepo(shopRenewalRepo)
    shopAPILogRepo := repository.NewShopAPILogRepository(db)
    shopHandler := handler.NewShopHandler(shopService).WithAPILogRepo(shopAPILogRepo).WithSlackWebhook(cfg.SlackWebhook)
    // Shop-Customer membership wiring
    custShopRepo := repository.NewCustomerShopRepository(db)
    shopCustSvc := service.NewShopCustomerService(custShopRepo)
    shopCustHandler := handler.NewShopCustomerHandler(shopCustSvc, shopRepo)
    customerService := service.NewCustomerService(customerRepo)
    customerHandler := handler.NewCustomerHandler(customerService)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
		AllowAllOrigins:  true,
	}))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

    setUpRouter(r, authHandler, userHandler, shopHandler, customerHandler, tokenRepo, shopCustHandler)

    // Schedule daily Slack notification at 08:00 local time if webhook is configured
    if cfg.SlackWebhook != "" {
        go scheduleDailyAt(cfg.Timezone, 8, 0, func(now time.Time) {
            sendDailySlack(shopService, cfg.SlackWebhook, now)
        })
    }

	fmt.Println("Server running at :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("server: %v", err)
	}
}

func setUpRouter(r *gin.Engine, authH *handler.AuthHandler, userH *handler.UserHandler, shopH *handler.ShopHandler, custH *handler.CustomerHandler, tokens domain.TokenRepository, shopCustH *handler.ShopCustomerHandler) {
    api := r.Group("/api")
    route.AuthRouter(api, authH, tokens)
    route.UsersRouter(api, userH, tokens)
    // Pass membership handler via shops router
    route.ShopsRouter(api, shopH, tokens, shopCustH)
    route.CustomersRouter(api, custH, tokens)
}

// scheduleDailyAt schedules f to run once per day at hour:min in the given timezone
func scheduleDailyAt(tz string, hour, min int, f func(now time.Time)) {
    loc := parseLocationOrFixed(tz)
    for {
        now := time.Now().In(loc)
        next := time.Date(now.Year(), now.Month(), now.Day(), hour, min, 0, 0, loc)
        if !next.After(now) {
            next = next.Add(24 * time.Hour)
        }
        d := time.Until(next)
        time.Sleep(d)
        // run
        f(time.Now().In(loc))
    }
}

type slackPayload struct {
    Text string `json:"text"`
}

func sendDailySlack(shopSvc *service.ShopService, webhook string, now time.Time) {
    // Collect shops within ±30 days window (notOver1y in repo semantics)
    items, _, err := shopSvc.ListPagedFiltered(1, 2000, "notOver1y", now)
    if err != nil || len(items) == 0 {
        return
    }
    var expired []string
    var expiring []string
    for _, s := range items {
        if s.ExpiredAt == nil { continue }
        days := int(s.ExpiredAt.Sub(now).Hours() / 24)
        // future days might be truncated; make non-zero future days at least 1
        if s.ExpiredAt.After(now) && (s.ExpiredAt.Sub(now).Hours() > 0) {
            if days < 1 { days = 1 }
        }
        if s.ExpiredAt.Before(now) {
            expired = append(expired, fmt.Sprintf("• %s — hết hạn %d ngày", s.Domain, -days))
        } else {
            expiring = append(expiring, fmt.Sprintf("• %s — còn %d ngày", s.Domain, days))
        }
    }
    if len(expired) == 0 && len(expiring) == 0 {
        return
    }
    msg := fmt.Sprintf("Báo cáo hằng ngày (08:00) — Shop không quá 1 tháng\nNgày: %s\nTổng: %d\nHết hạn: %d\nSắp hết hạn: %d\n\n", now.Format("2006-01-02"), len(items), len(expired), len(expiring))
    if len(expired) > 0 {
        msg += "Hết hạn:\n" + joinLines(expired) + "\n\n"
    }
    if len(expiring) > 0 {
        msg += "Sắp hết hạn:\n" + joinLines(expiring)
    }
    body, _ := json.Marshal(slackPayload{Text: msg})
    _ = httpPostJSON(webhook, body)
}

func httpPostJSON(url string, body []byte) error {
    req, _ := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    client := &http.Client{ Timeout: 10 * time.Second }
    resp, err := client.Do(req)
    if err != nil { return err }
    defer resp.Body.Close()
    return nil
}

func joinLines(lines []string) string {
    if len(lines) == 0 { return "" }
    out := lines[0]
    for i := 1; i < len(lines); i++ {
        out += "\n" + lines[i]
    }
    return out
}

// parseLocationOrFixed supports IANA names or fixed offsets like "+07:00", "UTC+7"
func parseLocationOrFixed(tz string) *time.Location {
    if tz == "" { return time.Local }
    if strings.HasPrefix(tz, "UTC") || strings.HasPrefix(tz, "GMT") {
        // e.g., UTC+7
        off := parseOffset(strings.TrimPrefix(strings.TrimPrefix(tz, "UTC"), "GMT"))
        return time.FixedZone(tz, off)
    }
    if tz[0] == '+' || tz[0] == '-' { // e.g., +07:00
        off := parseOffset(tz)
        return time.FixedZone("UTC"+tz, off)
    }
    if loc, err := time.LoadLocation(tz); err == nil { return loc }
    return time.Local
}

func parseOffset(s string) int {
    if s == "" { return 0 }
    sign := 1
    if s[0] == '-' { sign = -1; s = s[1:] } else if s[0] == '+' { s = s[1:] }
    // formats: HH or HH:MM
    var hh, mm int
    if len(s) >= 2 {
        hh = int((s[0]-'0')*10 + (s[1]-'0'))
    }
    if len(s) >= 5 && s[2] == ':' {
        mm = int((s[3]-'0')*10 + (s[4]-'0'))
    }
    return sign * ((hh*60+mm)*60)
}
