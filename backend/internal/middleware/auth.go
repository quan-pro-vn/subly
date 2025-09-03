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
        // Allow preflight without auth
        if c.Request.Method == http.MethodOptions {
            c.Next()
            return
        }

        auth := c.GetHeader("Authorization")
        if auth == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
            return
        }
        // Case-insensitive bearer support
        parts := strings.SplitN(auth, " ", 2)
        if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
            return
        }
        tokenStr := strings.TrimSpace(parts[1])
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
