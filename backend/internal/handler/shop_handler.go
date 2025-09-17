package handler

import (
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"

    "metronic/internal/service"
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
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    m, err := h.svc.Create(req.Domain, req.ExpiredAt)
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
        Months int     `json:"months" binding:"required"`
        Note   *string `json:"note"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    uidRaw, _ := c.Get("userID")
    performedBy, _ := uidRaw.(uint)
    shop, rec, err := h.svc.Renew(uint(id64), req.Months, performedBy, req.Note)
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
