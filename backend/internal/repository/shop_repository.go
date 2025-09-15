package repository

import (
    "metronic/internal/model"

    "gorm.io/gorm"
)

// ShopRepository handles shop persistence
type ShopRepository struct {
    db *gorm.DB
}

func NewShopRepository(db *gorm.DB) *ShopRepository {
    return &ShopRepository{db: db}
}

func (r *ShopRepository) Create(s *model.Shop) error {
    return r.db.Create(s).Error
}

func (r *ShopRepository) List() ([]model.Shop, error) {
    var items []model.Shop
    if err := r.db.Order("id DESC").Find(&items).Error; err != nil {
        return nil, err
    }
    return items, nil
}

func (r *ShopRepository) FindByID(id uint) (*model.Shop, error) {
    var s model.Shop
    if err := r.db.First(&s, id).Error; err != nil {
        return nil, err
    }
    return &s, nil
}

func (r *ShopRepository) FindByDomain(domain string) (*model.Shop, error) {
    var s model.Shop
    if err := r.db.Where("domain = ?", domain).First(&s).Error; err != nil {
        return nil, err
    }
    return &s, nil
}

func (r *ShopRepository) Update(s *model.Shop) error {
    return r.db.Save(s).Error
}

func (r *ShopRepository) DeleteByID(id uint) error {
    return r.db.Delete(&model.Shop{}, id).Error
}

