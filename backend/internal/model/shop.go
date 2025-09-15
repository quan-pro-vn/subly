package model

import "time"

// Shop represents a tenant/shop entity
type Shop struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"size:255" json:"name"`
    Domain    string    `gorm:"uniqueIndex;size:255" json:"domain"`
    Active    bool      `gorm:"default:true" json:"active"`
    CreatedAt time.Time `json:"-"`
    UpdatedAt time.Time `json:"-"`
}

