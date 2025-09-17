package handler

import (
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"

    "metronic/internal/service"
    "metronic/internal/model"
)

// ShopHandler handles HTTP requests for shops
type ShopHandler struct {
    svc *service.ShopService
}

func NewShopHandler(s *service.ShopService) *ShopHandler {
    return &ShopHandler{svc: s}
}

// CreateShop POST /shops
func (h *ShopHandler) CreateShop(c *gin.Context) {
    var req struct {
        Domain    string     `json:"domain" binding:"required"`
        ExpiredAt *time.Time `json:"expired_at"`
        PricePerCycle *int   `json:"price_per_cycle"`
        CycleMonths   *int   `json:"cycle_months"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    price := 0
    if req.PricePerCycle != nil { price = *req.PricePerCycle }
    cycle := 0
    if req.CycleMonths != nil { cycle = *req.CycleMonths }
    m, err := h.svc.Create(req.Domain, req.ExpiredAt, price, cycle)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, m)
}

// ListShops GET /shops
func (h *ShopHandler) ListShops(c *gin.Context) {
    // Parse pagination parameters: page (>=1), limit (default 50)
    page := 1
    limit := 50
    if v := c.Query("page"); v != "" {
        if p, err := strconv.Atoi(v); err == nil && p > 0 {
            page = p
        }
    }
    if v := c.Query("limit"); v != "" {
        if l, err := strconv.Atoi(v); err == nil && l > 0 {
            limit = l
        }
    }
    // Optional hard cap to prevent abuse
    if limit > 200 {
        limit = 200
    }

    filter := c.DefaultQuery("filter", "all")
    items, total, err := h.svc.ListPagedFiltered(page, limit, filter)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    totalPages := (total + int64(limit) - 1) / int64(limit)
    c.JSON(http.StatusOK, gin.H{
        "items":       items,
        "page":        page,
        "limit":       limit,
        "filter":      filter,
        "total":       total,
        "total_pages": totalPages,
    })
}

// ShopStats GET /shops/stats
func (h *ShopHandler) ShopStats(c *gin.Context) {
    stats, err := h.svc.Stats()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, stats)
}

// GetShop GET /shops/:id
func (h *ShopHandler) GetShop(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    m, err := h.svc.Get(uint(id))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, m)
}

// UpdateShop POST /shops/:id
func (h *ShopHandler) UpdateShop(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    var req struct {
        Domain    string     `json:"domain"`
        ExpiredAt *time.Time `json:"expired_at"`
        PricePerCycle *int   `json:"price_per_cycle"`
        CycleMonths   *int   `json:"cycle_months"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    m, err := h.svc.Update(uint(id), req.Domain, req.ExpiredAt)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    if req.PricePerCycle != nil || req.CycleMonths != nil {
        m, err = h.svc.UpdateBilling(uint(id), req.PricePerCycle, req.CycleMonths)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
    }
    c.JSON(http.StatusOK, m)
}

// DeleteShop DELETE /shops/:id
func (h *ShopHandler) DeleteShop(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    if err := h.svc.Delete(uint(id)); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.Status(http.StatusOK)
}

// ForceDeleteShop DELETE /shops/:id/force
func (h *ShopHandler) ForceDeleteShop(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    if err := h.svc.ForceDelete(uint(id)); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.Status(http.StatusOK)
}

// RestoreShop POST /shops/:id/restore
func (h *ShopHandler) RestoreShop(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    if err := h.svc.Restore(uint(id)); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.Status(http.StatusOK)
}

// RenewShop POST /shops/:id/renew { months, note? }
func (h *ShopHandler) RenewShop(c *gin.Context) {
    id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    var req struct {
        Months int      `json:"months"`
        Note   *string  `json:"note"`
        NextExpiredAt *time.Time `json:"next_expired_at"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    uidRaw, _ := c.Get("userID")
    performedBy, _ := uidRaw.(uint)
    var shop *model.Shop
    var rec *model.ShopRenewal
    if req.NextExpiredAt != nil {
        shop, rec, err = h.svc.RenewToDate(uint(id64), *req.NextExpiredAt, performedBy, req.Note)
    } else if req.Months > 0 {
        shop, rec, err = h.svc.Renew(uint(id64), req.Months, performedBy, req.Note)
    } else {
        c.JSON(http.StatusBadRequest, gin.H{"error": "months or next_expired_at required"})
        return
    }
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"shop": shop, "renewal": rec})
}

// ListRenewals GET /shops/:id/renewals
func (h *ShopHandler) ListRenewals(c *gin.Context) {
    id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    items, err := h.svc.ListRenewals(uint(id64))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, items)
}

// CheckStatus GET /shops/check?shop_uuid=...|domain=...
// Returns JSON with status and expiry information without auth.
func (h *ShopHandler) CheckStatus(c *gin.Context) {
    shopUUID := c.Query("shop_uuid")
    domain := c.Query("domain")
    var m *model.Shop
    var err error
    if shopUUID == "" && domain == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "shop_uuid or domain required"})
        return
    }
    if shopUUID != "" {
        m, err = h.svc.FindByUUID(shopUUID)
    } else {
        m, err = h.svc.FindByDomain(domain)
    }
    if err != nil {
        // Return a consistent payload for not-found to simplify integrations
        c.JSON(http.StatusOK, gin.H{"status": "not_found"})
        return
    }
    now := time.Now()
    var expiredAt *time.Time = m.ExpiredAt
    unlimited := expiredAt == nil
    valid := m.Active && (unlimited || !expiredAt.Before(now))
    var daysRemaining *int
    if !unlimited {
        d := int(expiredAt.Sub(now).Hours() / 24)
        // If still valid and there are remaining hours, count as at least 0 or positive
        daysRemaining = &d
    }
    resp := gin.H{
        "status":        func() string { if valid { return "valid" } else { return "expired" } }(),
        "active":        m.Active,
        "unlimited":     unlimited,
        "expired_at":    m.ExpiredAt,
        "now":           now,
        "shop_uuid":     m.UUID,
        "domain":        m.Domain,
    }
    if daysRemaining != nil {
        resp["days_remaining"] = *daysRemaining
    }
    c.JSON(http.StatusOK, resp)
}
