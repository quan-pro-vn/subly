package route

import (
    "github.com/gin-gonic/gin"

    "metronic/internal/domain"
    "metronic/internal/handler"
    "metronic/internal/middleware"
)

// ShopsRouter mounts shop CRUD routes
func ShopsRouter(r *gin.RouterGroup, h *handler.ShopHandler, tokens domain.TokenRepository, shopCustH *handler.ShopCustomerHandler) {
    auth := r.Group("/")
    auth.Use(middleware.Auth(tokens))

    auth.GET("/shops", h.ListShops)
    auth.POST("/shops", h.CreateShop)
    auth.GET("/shops/:id", h.GetShop)
    auth.POST("/shops/:id", h.UpdateShop)
    auth.DELETE("/shops/:id", h.DeleteShop)

    if shopCustH != nil {
        auth.POST("/shops/:id/customers", shopCustH.Assign)
        auth.DELETE("/shops/:id/customers/:user_id", shopCustH.Remove)
    }
}
