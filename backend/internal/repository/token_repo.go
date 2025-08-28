package repository

import (
	"time"

	"metronic/internal/domain"

	"gorm.io/gorm"
)

// TokenRepository implements domain.TokenRepository using GORM
type TokenRepository struct {
	db *gorm.DB
}

var _ domain.TokenRepository = (*TokenRepository)(nil)

func NewTokenRepository(db *gorm.DB) *TokenRepository {
	return &TokenRepository{db: db}
}

func (r *TokenRepository) Create(t *domain.Token) error {
	return r.db.Create(t).Error
}

func (r *TokenRepository) FindByHash(hash string) (*domain.Token, error) {
	var tok domain.Token
	if err := r.db.Where("token_hash = ?", hash).First(&tok).Error; err != nil {
		return nil, err
	}
	return &tok, nil
}

func (r *TokenRepository) RevokeByID(id uint) error {
	return r.db.Model(&domain.Token{}).Where("id = ?", id).Update("revoked", true).Error
}

func (r *TokenRepository) RevokeAllByUserID(userID uint) error {
	return r.db.Model(&domain.Token{}).Where("user_id = ?", userID).Update("revoked", true).Error
}

func (r *TokenRepository) UpdateUsage(id uint, ip, ua string, t time.Time) error {
	updates := map[string]interface{}{"last_used_at": t}
	if ip != "" {
		updates["ip"] = ip
	}
	if ua != "" {
		updates["user_agent"] = ua
	}
	return r.db.Model(&domain.Token{}).Where("id = ?", id).Updates(updates).Error
}
