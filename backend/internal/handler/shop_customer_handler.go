package handler

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"

    "metronic/internal/service"
)

// ShopCustomerHandler handles assigning customers to shops
type ShopCustomerHandler struct {
    svc *service.ShopCustomerService
}

func NewShopCustomerHandler(s *service.ShopCustomerService) *ShopCustomerHandler {
    return &ShopCustomerHandler{svc: s}
}

// Assign POST /shops/:uuid/customers
func (h *ShopCustomerHandler) Assign(c *gin.Context) {
    shopUUID := c.Param("id")
    if shopUUID == "" {
        shopUUID = c.Param("uuid")
    }
    var req struct {
        UserID  uint   `json:"user_id" binding:"required"`
        Role    string `json:"role"`
        IsOwner bool   `json:"is_owner"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    if err := h.svc.Assign(shopUUID, req.UserID, req.Role, req.IsOwner); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.Status(http.StatusOK)
}

// Remove DELETE /shops/:uuid/customers/:user_id
func (h *ShopCustomerHandler) Remove(c *gin.Context) {
    shopUUID := c.Param("id")
    if shopUUID == "" {
        shopUUID = c.Param("uuid")
    }
    uidStr := c.Param("user_id")
    userID, err := strconv.ParseUint(uidStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
        return
    }
    if err := h.svc.Remove(shopUUID, uint(userID)); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.Status(http.StatusOK)
}

