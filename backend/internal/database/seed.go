package database

import (
    "fmt"

    "gorm.io/gorm"

    "metronic/internal/model"
    "metronic/internal/security"
)

// Seed creates default roles and demo users for quick login
func Seed(db *gorm.DB) error {
    // Roles
    roles := []model.Role{
        {Name: "admin"},
        {Name: "user"},
    }
    for _, r := range roles {
        var existing model.Role
        if err := db.Where("name = ?", r.Name).First(&existing).Error; err != nil {
            if err := db.Create(&r).Error; err != nil {
                return fmt.Errorf("seed role %s: %w", r.Name, err)
            }
        }
    }

    // Demo users with ISO-strong password
    // 12+ chars, upper, lower, number, special
    strongPassword := "ISO27001!Demo@2025"
    hash, err := security.HashPassword(strongPassword)
    if err != nil {
        return fmt.Errorf("hash password: %w", err)
    }

    // Admin user
    var adminRole model.Role
    if err := db.Where("name = ?", "admin").First(&adminRole).Error; err != nil {
        return fmt.Errorf("load admin role: %w", err)
    }
    var userRole model.Role
    if err := db.Where("name = ?", "user").First(&userRole).Error; err != nil {
        return fmt.Errorf("load user role: %w", err)
    }

    ensureUser := func(email, name string, roles []model.Role) error {
        var u model.User
        if err := db.Where("email = ?", email).First(&u).Error; err == nil {
            // Ensure roles linked
            return db.Model(&u).Association("Roles").Replace(roles)
        }
        u = model.User{Email: email, Name: name, Password: hash, Roles: roles}
        return db.Create(&u).Error
    }

    if err := ensureUser("admin@example.com", "Admin", []model.Role{adminRole}); err != nil {
        return fmt.Errorf("seed admin user: %w", err)
    }
    if err := ensureUser("user@example.com", "User", []model.Role{userRole}); err != nil {
        return fmt.Errorf("seed user: %w", err)
    }

    return nil
}

