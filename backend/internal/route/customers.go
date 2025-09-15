package route

import (
    "github.com/gin-gonic/gin"
    "metronic/internal/domain"
    "metronic/internal/handler"
    "metronic/internal/middleware"
)

// CustomersRouter mounts customer routes
func CustomersRouter(r *gin.RouterGroup, h *handler.CustomerHandler, tokens domain.TokenRepository) {
    auth := r.Group("/")
    auth.Use(middleware.Auth(tokens))
    auth.GET("/customers", h.ListCustomers)
    auth.GET("/customers/:id", h.GetCustomer)
    auth.DELETE("/customers/:id", h.DeleteCustomer)
}
