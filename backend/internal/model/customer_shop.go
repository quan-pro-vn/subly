package model

// CustomerShop maps customers to shops (many-to-many)
// Backed by table `customer_shop` with unique (shop_uuid, user_id)
type CustomerShop struct {
    ID       uint   `gorm:"primaryKey" json:"id"`
    ShopUUID string `gorm:"size:255;index" json:"shop_uuid"`
    UserID   uint   `json:"user_id"`
    IsOwner  bool   `json:"is_owner"`
    Role     string `json:"role"`
}

func (CustomerShop) TableName() string { return "customer_shop" }

