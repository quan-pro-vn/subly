package model

import "time"

// ShopAPILog stores a record of public API check calls per shop
type ShopAPILog struct {
    ID           uint      `gorm:"primaryKey" json:"id"`
    ShopID       uint      `gorm:"index" json:"shop_id"`
    ShopUUID     string    `gorm:"size:36;index" json:"shop_uuid"`
    ShopDomain   *string   `gorm:"-" json:"shop_domain,omitempty"`
    DomainParam  *string   `gorm:"size:255" json:"domain_param,omitempty"`
    UUIDParam    *string   `gorm:"size:255" json:"uuid_param,omitempty"`
    ClientIP     string    `gorm:"size:64" json:"client_ip"`
    UserAgent    string    `gorm:"size:500" json:"user_agent"`
    Status       string    `gorm:"size:32" json:"status"`
    CreatedAt    time.Time `json:"created_at"`
}

func (ShopAPILog) TableName() string { return "shop_api_logs" }
