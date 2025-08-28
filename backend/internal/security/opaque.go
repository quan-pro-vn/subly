package security

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"os"
	"time"
)

// AccessTokenTTL defines how long an access token is valid.
// It defaults to 2 hours but can be overridden by ACCESS_TOKEN_TTL env var.
var AccessTokenTTL = func() time.Duration {
	if v := os.Getenv("ACCESS_TOKEN_TTL"); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return 2 * time.Hour
}()

// GenerateToken returns the plain token, its sha256 hash, and expiry time.
func GenerateToken() (string, string, time.Time) {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	plain := hex.EncodeToString(b)
	hash := HashToken(plain)
	expiresAt := time.Now().Add(AccessTokenTTL)
	return plain, hash, expiresAt
}

// HashToken returns the sha256 hash of a token in hex encoding.
func HashToken(plain string) string {
	sum := sha256.Sum256([]byte(plain))
	return hex.EncodeToString(sum[:])
}
