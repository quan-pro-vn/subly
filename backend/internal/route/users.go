package route

import (
    "github.com/gin-gonic/gin"

    "metronic/internal/domain"
    "metronic/internal/handler"
    "metronic/internal/middleware"
)

// UsersRouter mounts user CRUD routes
func UsersRouter(r *gin.RouterGroup, h *handler.UserHandler, tokens domain.TokenRepository) {
    auth := r.Group("/")
    auth.Use(middleware.Auth(tokens))

    auth.GET("/users", h.ListUsers)
    auth.POST("/users", h.CreateUser)
    auth.GET("/users/:id", h.GetUser)
    auth.POST("/users/:id", h.UpdateUser)
    auth.DELETE("/users/:id", h.DeleteUser)
}
