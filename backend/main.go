package main

import (
	"fmt"
	"log"
	"time"

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
    shopHandler := handler.NewShopHandler(shopService).WithAPILogRepo(shopAPILogRepo)
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
