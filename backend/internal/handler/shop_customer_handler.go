package handler

import (
    "net/http"
    "strconv"
    "unicode"

    "github.com/gin-gonic/gin"

    "metronic/internal/repository"
    "metronic/internal/service"
)

// ShopCustomerHandler handles assigning customers to shops
type ShopCustomerHandler struct {
    svc   *service.ShopCustomerService
    shops *repository.ShopRepository
}

func NewShopCustomerHandler(s *service.ShopCustomerService, shops *repository.ShopRepository) *ShopCustomerHandler {
    return &ShopCustomerHandler{svc: s, shops: shops}
}

func (h *ShopCustomerHandler) resolveShopUUID(param string) (string, error) {
    if param == "" {
        return "", nil
    }
    // If all digits, treat as numeric ID and resolve to UUID
    isDigits := true
    for _, r := range param {
        if !unicode.IsDigit(r) {
            isDigits = false
            break
        }
    }
    if !isDigits {
        return param, nil
    }
    // lookup by ID
    id64, err := strconv.ParseUint(param, 10, 64)
    if err != nil {
        return "", err
    }
    s, err := h.shops.FindByID(uint(id64))
    if err != nil {
        return "", err
    }
    return s.UUID, nil
}

// Assign POST /shops/:id/customers
func (h *ShopCustomerHandler) Assign(c *gin.Context) {
    raw := c.Param("id")
    shopUUID, err := h.resolveShopUUID(raw)
    if err != nil || shopUUID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid shop identifier"})
        return
    }
    var req struct {
        CustomerID uint   `json:"customer_id" binding:"required"`
        Role       string `json:"role"`
        IsOwner    bool   `json:"is_owner"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    if err := h.svc.Assign(shopUUID, req.CustomerID, req.Role, req.IsOwner); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.Status(http.StatusOK)
}

// Remove DELETE /shops/:id/customers/:user_id
func (h *ShopCustomerHandler) Remove(c *gin.Context) {
    raw := c.Param("id")
    shopUUID, err := h.resolveShopUUID(raw)
    if err != nil || shopUUID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid shop identifier"})
        return
    }
    uidStr := c.Param("customer_id")
    userID, err := strconv.ParseUint(uidStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid customer_id"})
        return
    }
    if err := h.svc.Remove(shopUUID, uint(userID)); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.Status(http.StatusOK)
}
