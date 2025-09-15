package repository

import (
    "metronic/internal/model"

    "gorm.io/gorm"
)

type CustomerShopRepository struct {
    db *gorm.DB
}

func NewCustomerShopRepository(db *gorm.DB) *CustomerShopRepository {
    return &CustomerShopRepository{db: db}
}

func (r *CustomerShopRepository) Add(shopUUID string, userID uint, role string, isOwner bool) error {
    rec := &model.CustomerShop{ShopUUID: shopUUID, UserID: userID, Role: role, IsOwner: isOwner}
    return r.db.Create(rec).Error
}

func (r *CustomerShopRepository) Remove(shopUUID string, userID uint) error {
    return r.db.Where("shop_uuid = ? AND user_id = ?", shopUUID, userID).Delete(&model.CustomerShop{}).Error
}

func (r *CustomerShopRepository) ListCustomerIDsByShop(shopUUID string) ([]uint, error) {
    var ids []uint
    if err := r.db.Model(&model.CustomerShop{}).Where("shop_uuid = ?", shopUUID).Pluck("user_id", &ids).Error; err != nil {
        return nil, err
    }
    return ids, nil
}

