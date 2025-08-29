package route

import (
	"github.com/gin-gonic/gin"

	"metronic/internal/domain"
	"metronic/internal/handler"
	"metronic/internal/middleware"
)

// AuthRouter mounts authentication routes under the given router group.
func AuthRouter(r *gin.RouterGroup, h *handler.AuthHandler, tokens domain.TokenRepository) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.POST("/auth/register", h.Register)
	r.POST("/auth/login", h.Login)

	auth := r.Group("/")
	auth.Use(middleware.Auth(tokens))
	auth.POST("/auth/logout", h.Logout)
	auth.GET("/auth/me", h.Me)
}
