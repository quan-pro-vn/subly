package handler

import (
    "net/http"
    "strconv"

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
        Name   string `json:"name" binding:"required"`
        Domain string `json:"domain" binding:"required"`
        Active *bool  `json:"active"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    active := true
    if req.Active != nil {
        active = *req.Active
    }
    m, err := h.svc.Create(req.Name, req.Domain, active)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, m)
}

// ListShops GET /shops
func (h *ShopHandler) ListShops(c *gin.Context) {
    items, err := h.svc.List()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, items)
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
        Name   string `json:"name"`
        Domain string `json:"domain"`
        Active *bool  `json:"active"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    m, err := h.svc.Update(uint(id), req.Name, req.Domain, req.Active)
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

