package repository

import (
    "metronic/internal/model"

    "gorm.io/gorm"
)

type ShopRenewalRepository struct {
    db *gorm.DB
}

func NewShopRenewalRepository(db *gorm.DB) *ShopRenewalRepository {
    return &ShopRenewalRepository{db: db}
}

func (r *ShopRenewalRepository) Create(rec *model.ShopRenewal) error {
    return r.db.Create(rec).Error
}

func (r *ShopRenewalRepository) ListByShopID(shopID uint) ([]model.ShopRenewal, error) {
    var items []model.ShopRenewal
    if err := r.db.Where("shop_id = ?", shopID).Order("id DESC").Find(&items).Error; err != nil {
        return nil, err
    }
    return items, nil
}

