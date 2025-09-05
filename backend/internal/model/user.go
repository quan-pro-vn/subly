package model

import "time"

// User represents application user
type User struct {
    ID        uint   `gorm:"primaryKey" json:"id"`
    Name      string `gorm:"size:255" json:"name"`
    Email     string `gorm:"uniqueIndex;size:255" json:"email"`
    Password  string `json:"-"`
    Roles     []Role `gorm:"many2many:user_roles" json:"roles,omitempty"`
    CreatedAt time.Time
    UpdatedAt time.Time
}
