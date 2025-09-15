package handler

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"

    "metronic/internal/model"
    "metronic/internal/service"
)

// CustomerHandler handles HTTP requests for customers
type CustomerHandler struct {
    svc *service.CustomerService
}

func NewCustomerHandler(s *service.CustomerService) *CustomerHandler {
    return &CustomerHandler{svc: s}
}

// ListCustomers GET /customers
// Optional query: ?shop_uuid=UUID to filter customers linked to a shop
func (h *CustomerHandler) ListCustomers(c *gin.Context) {
    shopUUID := c.Query("shop_uuid")
    var (
        items []model.Customer
        err error
    )
    if shopUUID != "" {
        items, err = h.svc.ListByShop(shopUUID)
    } else {
        items, err = h.svc.List()
    }
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, items)
}

// GetCustomer GET /customers/:id
func (h *CustomerHandler) GetCustomer(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }
    item, err := h.svc.Get(uint(id))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, item)
}

// DeleteCustomer DELETE /customers/:id
func (h *CustomerHandler) DeleteCustomer(c *gin.Context) {
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
