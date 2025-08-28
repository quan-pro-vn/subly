package model

import "time"

// RefreshToken keeps track of issued refresh tokens for rotation
type RefreshToken struct {
	ID        uint   `gorm:"primaryKey"`
	TokenID   string `gorm:"uniqueIndex;size:64"`
	UserID    uint
	ExpiresAt time.Time
	CreatedAt time.Time
}
