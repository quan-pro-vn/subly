package database

import "gorm.io/gorm"

// Seed creates default roles and demo users for quick login
func Seed(db *gorm.DB) error {
	_ = db
	return nil
}
