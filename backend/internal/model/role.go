package model

// Role represents a role in RBAC
type Role struct {
    ID   uint   `gorm:"primaryKey" json:"id"`
    Name string `gorm:"uniqueIndex;size:100" json:"name"`
    // Backrefs
    Users       []User       `gorm:"many2many:user_roles" json:"-"`
    Permissions []Permission `gorm:"many2many:role_permissions" json:"permissions,omitempty"`
}

// Permission represents a permission/action in RBAC
type Permission struct {
    ID   uint   `gorm:"primaryKey" json:"id"`
    Code string `gorm:"uniqueIndex;size:150" json:"code"`
    Name string `gorm:"size:255" json:"name"`
}

