package domain

import "time"

// Token represents an opaque API token stored hashed in the database
// The plain token is never stored.
type Token struct {
	ID         uint      `gorm:"primaryKey"`
	UserID     uint      `gorm:"index:idx_user_id"`
	Name       *string   `gorm:"size:255"`
	TokenHash  string    `gorm:"uniqueIndex:ux_token_hash;size:64"`
	Revoked    bool      `gorm:"default:false"`
	ExpiresAt  time.Time `gorm:"index"`
	LastUsedAt *time.Time
	IP         *string `gorm:"size:45"`
	UserAgent  *string `gorm:"size:255"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// TableName sets custom table name
func (Token) TableName() string {
	return "api_tokens"
}

// TokenRepository defines persistence operations for tokens
type TokenRepository interface {
	Create(t *Token) error
	FindByHash(hash string) (*Token, error)
	RevokeByID(id uint) error
	RevokeAllByUserID(userID uint) error
	UpdateUsage(id uint, ip, ua string, t time.Time) error
}
