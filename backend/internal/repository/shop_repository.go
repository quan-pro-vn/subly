package repository

import (
    "time"

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

// ListPaged returns shops ordered by id DESC with total count
func (r *ShopRepository) ListPaged(page, limit int) ([]model.Shop, int64, error) {
    if page < 1 {
        page = 1
    }
    if limit <= 0 {
        limit = 50
    }
    var total int64
    if err := r.db.Model(&model.Shop{}).Count(&total).Error; err != nil {
        return nil, 0, err
    }
    var items []model.Shop
    offset := (page - 1) * limit
    if err := r.db.Order("id DESC").Limit(limit).Offset(offset).Find(&items).Error; err != nil {
        return nil, 0, err
    }
    return items, total, nil
}

// ListPagedFiltered applies a filter and ordering similar to UI expectations
// filter values: "all", "valid", "expired", "notOver1y", "expiring"
func (r *ShopRepository) ListPagedFiltered(page, limit int, filter string, now time.Time) ([]model.Shop, int64, error) {
    if page < 1 {
        page = 1
    }
    if limit <= 0 {
        limit = 50
    }
    q := r.db.Model(&model.Shop{})
    // Apply where clause per filter
    switch filter {
    case "valid":
        q = q.Where("expired_at IS NULL OR expired_at >= ?", now)
    case "expired":
        q = q.Where("expired_at IS NOT NULL AND expired_at < ?", now)
    case "notOver1y":
        // Interpret as within ±30 days around now
        lower := now.AddDate(0, 0, -30)
        upper := now.AddDate(0, 0, 30)
        q = q.Where("expired_at IS NOT NULL AND expired_at >= ? AND expired_at <= ?", lower, upper)
    case "expiring":
        upper := now.AddDate(0, 0, 30)
        q = q.Where("expired_at IS NOT NULL AND expired_at >= ? AND expired_at <= ?", now, upper)
    case "trashed":
        q = r.db.Unscoped().Model(&model.Shop{}).Where("deleted_at IS NOT NULL")
    default:
        // all: no where
    }

    var total int64
    if err := q.Count(&total).Error; err != nil {
        return nil, 0, err
    }
    // Ordering per filter
    switch filter {
    case "valid":
        // valid first by soonest expiry, nulls last
        q = q.Order("CASE WHEN expired_at IS NULL THEN 1 ELSE 0 END ASC").Order("expired_at ASC")
    case "expired":
        q = q.Order("expired_at DESC")
    case "expiring":
        q = q.Order("expired_at ASC")
    case "trashed":
        q = q.Order("deleted_at DESC")
    case "notOver1y":
        q = q.Order("expired_at ASC")
    default:
        q = q.Order("id DESC")
    }
    var items []model.Shop
    offset := (page - 1) * limit
    if err := q.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
        return nil, 0, err
    }
    return items, total, nil
}

// ShopStats holds counts for sidebar badges
type ShopStats struct {
    All       int64
    Valid     int64
    Expired   int64
    NotOver1y int64
    Expiring  int64
    Trashed   int64
}

// Stats computes counts for different categories
func (r *ShopRepository) Stats(now time.Time) (ShopStats, error) {
    var out ShopStats
    if err := r.db.Model(&model.Shop{}).Count(&out.All).Error; err != nil {
        return out, err
    }
    if err := r.db.Model(&model.Shop{}).
        Where("expired_at IS NULL OR expired_at >= ?", now).
        Count(&out.Valid).Error; err != nil {
        return out, err
    }
    if err := r.db.Model(&model.Shop{}).
        Where("expired_at IS NOT NULL AND expired_at < ?", now).
        Count(&out.Expired).Error; err != nil {
        return out, err
    }
    // NotOver1y now means within ±30 days around now
    lower := now.AddDate(0, 0, -30)
    upper := now.AddDate(0, 0, 30)
    if err := r.db.Model(&model.Shop{}).
        Where("expired_at IS NOT NULL AND expired_at >= ? AND expired_at <= ?", lower, upper).
        Count(&out.NotOver1y).Error; err != nil {
        return out, err
    }
    // reuse upper for expiring window
    upper = now.AddDate(0, 0, 30)
    if err := r.db.Model(&model.Shop{}).
        Where("expired_at IS NOT NULL AND expired_at >= ? AND expired_at <= ?", now, upper).
        Count(&out.Expiring).Error; err != nil {
        return out, err
    }
    if err := r.db.Unscoped().Model(&model.Shop{}).
        Where("deleted_at IS NOT NULL").
        Count(&out.Trashed).Error; err != nil {
        return out, err
    }
    return out, nil
}

// RestoreByID clears soft-delete flag
func (r *ShopRepository) RestoreByID(id uint) error {
    return r.db.Unscoped().Model(&model.Shop{}).Where("id = ?", id).Update("deleted_at", nil).Error
}

// ForceDeleteByID permanently deletes a shop
func (r *ShopRepository) ForceDeleteByID(id uint) error {
    return r.db.Unscoped().Delete(&model.Shop{}, id).Error
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

func (r *ShopRepository) FindByUUID(uuid string) (*model.Shop, error) {
    var s model.Shop
    if err := r.db.Where("uuid = ?", uuid).First(&s).Error; err != nil {
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
