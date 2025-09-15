package handler

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"

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
func (h *CustomerHandler) ListCustomers(c *gin.Context) {
    items, err := h.svc.List()
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

