package repository

import (
    "metronic/internal/model"
    "gorm.io/gorm"
)

// CustomerRepository queries customers from legacy users table
type CustomerRepository struct {
    db *gorm.DB
}

func NewCustomerRepository(db *gorm.DB) *CustomerRepository {
    return &CustomerRepository{db: db}
}

func (r *CustomerRepository) List() ([]model.Customer, error) {
    var items []model.Customer
    if err := r.db.Model(&model.Customer{}).Order("id DESC").Find(&items).Error; err != nil {
        return nil, err
    }
    return items, nil
}

func (r *CustomerRepository) FindByID(id uint) (*model.Customer, error) {
    var c model.Customer
    if err := r.db.Model(&model.Customer{}).First(&c, id).Error; err != nil {
        return nil, err
    }
    return &c, nil
}

func (r *CustomerRepository) DeleteByID(id uint) error {
    return r.db.Delete(&model.Customer{}, id).Error
}

func (r *CustomerRepository) ListByShopUUID(shopUUID string) ([]model.Customer, error) {
    var items []model.Customer
    q := r.db.Table("customers c").
        Joins("JOIN customer_shop cs ON cs.user_id = c.id").
        Where("cs.shop_uuid = ?", shopUUID).
        Order("c.id DESC").
        Select("c.id, c.name, c.email, c.phone, c.note, c.created_at, c.updated_at")
    if err := q.Scan(&items).Error; err != nil {
        return nil, err
    }
    return items, nil
}
