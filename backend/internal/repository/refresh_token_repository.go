package repository

import (
	"time"

	"metronic/internal/model"

	"gorm.io/gorm"
)

// RefreshTokenRepository handles refresh token persistence
type RefreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

func (r *RefreshTokenRepository) Create(token *model.RefreshToken) error {
	return r.db.Create(token).Error
}

func (r *RefreshTokenRepository) Delete(tokenID string) error {
	return r.db.Where("token_id = ?", tokenID).Delete(&model.RefreshToken{}).Error
}

func (r *RefreshTokenRepository) Get(tokenID string) (*model.RefreshToken, error) {
	var t model.RefreshToken
	if err := r.db.Where("token_id = ?", tokenID).First(&t).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *RefreshTokenRepository) DeleteExpired(now time.Time) error {
	return r.db.Where("expires_at < ?", now).Delete(&model.RefreshToken{}).Error
}
