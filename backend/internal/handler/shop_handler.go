package handler

import (
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"

    "metronic/internal/service"
    "metronic/internal/model"
    "metronic/internal/repository"
)

// ShopHandler handles HTTP requests for shops
type ShopHandler struct {
    svc *service.ShopService
    apiLogs *repository.ShopAPILogRepository
}

func NewShopHandler(s *service.ShopService) *ShopHandler {
    return &ShopHandler{svc: s}
}

func (h *ShopHandler) WithAPILogRepo(r *repository.ShopAPILogRepository) *ShopHandler {
    h.apiLogs = r
    return h
}

// CreateShop POST /shops
func (h *ShopHandler) CreateShop(c *gin.Context) {
    var req struct {
        Domain    string     `json:"domain" binding:"required"`
        ExpiredAt *time.Time `json:"expired_at"`
        PricePerCycle *IntOrString `json:"price_per_cycle"`
        CycleMonths   *IntOrString `json:"cycle_months"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    price := 0
    if req.PricePerCycle != nil { price = int(*req.PricePerCycle) }
    cycle := 0
    if req.CycleMonths != nil { cycle = int(*req.CycleMonths) }
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
        // NOTE: expired_at is ignored on update; use renew endpoints instead
        PricePerCycle *IntOrString `json:"price_per_cycle"`
        CycleMonths   *IntOrString `json:"cycle_months"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    // Do not allow updating expired_at via Update; pass nil to keep existing
    m, err := h.svc.Update(uint(id), req.Domain, nil)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    if req.PricePerCycle != nil || req.CycleMonths != nil {
        var pp *int
        var cm *int
        if req.PricePerCycle != nil { v := int(*req.PricePerCycle); pp = &v }
        if req.CycleMonths != nil { v := int(*req.CycleMonths); cm = &v }
        m, err = h.svc.UpdateBilling(uint(id), pp, cm)
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

// RevokeShop POST /shops/:id/revoke
// Force set expired_at to an immediate past timestamp
func (h *ShopHandler) RevokeShop(c *gin.Context) {
    id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    m, err := h.svc.RevokeNow(uint(id64))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, m)
}

// RenewShop POST /shops/:id/renew { months, note? }
func (h *ShopHandler) RenewShop(c *gin.Context) {
    id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    var req struct {
        Months *IntOrString `json:"months"`
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
    } else if req.Months != nil && int(*req.Months) > 0 {
        shop, rec, err = h.svc.Renew(uint(id64), int(*req.Months), performedBy, req.Note)
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
        // Ensure we still log the attempt even when no shop matched
        if h.apiLogs != nil {
            go func() {
                domainPtr := func() *string { if domain == "" { return nil }; v:=domain; return &v }()
                uuidPtr := func() *string { if shopUUID == "" { return nil }; v:=shopUUID; return &v }()
                _ = h.apiLogs.Create(&model.ShopAPILog{
                    ShopID:      0,
                    ShopUUID:    "",
                    DomainParam: domainPtr,
                    UUIDParam:   uuidPtr,
                    ClientIP:    c.ClientIP(),
                    UserAgent:   c.GetHeader("User-Agent"),
                    Status:      "not_found",
                })
            }()
        }
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

    // log call (best-effort)
    if h.apiLogs != nil {
        go func() {
            domainPtr := func() *string { if domain == "" { return nil }; v:=domain; return &v }()
            uuidPtr := func() *string { if shopUUID == "" { return nil }; v:=shopUUID; return &v }()
            _ = h.apiLogs.Create(&model.ShopAPILog{
                ShopID:      func() uint { if m != nil { return m.ID }; return 0 }(),
                ShopUUID:    func() string { if m != nil { return m.UUID }; return "" }(),
                DomainParam: domainPtr,
                UUIDParam:   uuidPtr,
                ClientIP:    c.ClientIP(),
                UserAgent:   c.GetHeader("User-Agent"),
                Status:      func() string { if s, ok := resp["status"].(string); ok { return s }; return "unknown" }(),
            })
        }()
    }
}

// ListAPILogs GET /shops/:id/api-logs
func (h *ShopHandler) ListAPILogs(c *gin.Context) {
    id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    page := 1
    limit := 50
    if v := c.Query("page"); v != "" {
        if p, err := strconv.Atoi(v); err == nil && p > 0 { page = p }
    }
    if v := c.Query("limit"); v != "" {
        if l, err := strconv.Atoi(v); err == nil && l > 0 { limit = l }
    }
    items, total, err := h.apiLogs.ListByShopIDPaged(uint(id64), page, limit)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{ "items": items, "page": page, "limit": limit, "total": total })
}

// ListAllAPILogs GET /api-logs
func (h *ShopHandler) ListAllAPILogs(c *gin.Context) {
    page := 1
    limit := 50
    if v := c.Query("page"); v != "" {
        if p, err := strconv.Atoi(v); err == nil && p > 0 { page = p }
    }
    if v := c.Query("limit"); v != "" {
        if l, err := strconv.Atoi(v); err == nil && l > 0 { limit = l }
    }
    if h.apiLogs == nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "api logs repository not configured"})
        return
    }
    var domainParam *string
    var uuidParam *string
    var status *string
    if v := c.Query("domain_param"); v != "" { domainParam = &[]string{v}[0] }
    if v := c.Query("uuid_param"); v != "" { uuidParam = &[]string{v}[0] }
    if v := c.Query("status"); v != "" { status = &[]string{v}[0] }
    items, total, err := h.apiLogs.ListAllPaged(page, limit, domainParam, uuidParam, status)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{ "items": items, "page": page, "limit": limit, "total": total })
}
