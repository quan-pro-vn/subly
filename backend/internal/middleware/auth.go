package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"metronic/internal/domain"
	"metronic/internal/security"
)

// Auth verifies bearer token and loads user ID into context
func Auth(tokens domain.TokenRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		tokenStr := strings.TrimSpace(strings.TrimPrefix(auth, "Bearer "))
		hash := security.HashToken(tokenStr)
		tok, err := tokens.FindByHash(hash)
		if err != nil || tok.Revoked || tok.ExpiresAt.Before(time.Now()) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.Set("userID", tok.UserID)
		c.Set("token", tok)
		// update last used info asynchronously (ignore error)
		_ = tokens.UpdateUsage(tok.ID, c.ClientIP(), c.GetHeader("User-Agent"), time.Now())
		c.Next()
	}
}
