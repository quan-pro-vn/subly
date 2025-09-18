package repository

import (
    "metronic/internal/model"

    "gorm.io/gorm"
)

type ShopAPILogRepository struct {
    db *gorm.DB
}

func NewShopAPILogRepository(db *gorm.DB) *ShopAPILogRepository {
    return &ShopAPILogRepository{db: db}
}

func (r *ShopAPILogRepository) Create(rec *model.ShopAPILog) error {
    return r.db.Create(rec).Error
}

func (r *ShopAPILogRepository) ListByShopID(shopID uint, limit int) ([]model.ShopAPILog, error) {
    if limit <= 0 || limit > 200 {
        limit = 50
    }
    var items []model.ShopAPILog
    if err := r.db.Where("shop_id = ?", shopID).Order("id DESC").Limit(limit).Find(&items).Error; err != nil {
        return nil, err
    }
    return items, nil
}

func (r *ShopAPILogRepository) ListByShopIDPaged(shopID uint, page, limit int) ([]model.ShopAPILog, int64, error) {
    if page < 1 { page = 1 }
    if limit <= 0 || limit > 200 { limit = 50 }
    q := r.db.Model(&model.ShopAPILog{}).
        Where("shop_id = ?", shopID).
        Joins("LEFT JOIN shops ON shops.id = shop_api_logs.shop_id").
        Select("shop_api_logs.*, shops.domain AS shop_domain")
    var total int64
    if err := q.Count(&total).Error; err != nil { return nil, 0, err }
    var items []model.ShopAPILog
    if err := q.Order("id DESC").Limit(limit).Offset((page-1)*limit).Find(&items).Error; err != nil {
        return nil, 0, err
    }
    return items, total, nil
}

// ListAllPaged returns all API logs across shops with pagination
func (r *ShopAPILogRepository) ListAllPaged(page, limit int, domainParam, uuidParam, status *string) ([]model.ShopAPILog, int64, error) {
    if page < 1 { page = 1 }
    if limit <= 0 || limit > 200 { limit = 50 }
    q := r.db.Model(&model.ShopAPILog{}).
        Joins("LEFT JOIN shops ON shops.id = shop_api_logs.shop_id").
        Select("shop_api_logs.*, shops.domain AS shop_domain")
    if domainParam != nil && *domainParam != "" {
        like := "%" + *domainParam + "%"
        q = q.Where("domain_param LIKE ?", like)
    }
    if uuidParam != nil && *uuidParam != "" {
        like := "%" + *uuidParam + "%"
        q = q.Where("uuid_param LIKE ?", like)
    }
    if status != nil && *status != "" && *status != "all" {
        q = q.Where("status = ?", *status)
    }
    var total int64
    if err := q.Count(&total).Error; err != nil { return nil, 0, err }
    var items []model.ShopAPILog
    if err := q.Order("id DESC").Limit(limit).Offset((page-1)*limit).Find(&items).Error; err != nil {
        return nil, 0, err
    }
    return items, total, nil
}
