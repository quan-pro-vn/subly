package model

import "time"

// ShopRenewal records a renewal action for a shop
type ShopRenewal struct {
    ID          uint       `gorm:"primaryKey" json:"id"`
    ShopID      uint       `gorm:"index" json:"shop_id"`
    Months      int        `json:"months"`
    OldExpiredAt *time.Time `json:"old_expired_at"`
    NewExpiredAt time.Time  `json:"new_expired_at"`
    Note        *string    `gorm:"size:500" json:"note,omitempty"`
    PerformedBy uint       `json:"performed_by"`
    CreatedAt   time.Time  `json:"created_at"`
}

func (ShopRenewal) TableName() string { return "shop_renewals" }

