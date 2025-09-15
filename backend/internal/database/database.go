package database

import (
    "gorm.io/driver/mysql"
    "gorm.io/gorm"

    "metronic/internal/domain"
    "metronic/internal/model"
)

// Connect opens database connection and migrates models
func Connect(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
    if err := db.AutoMigrate(
        &model.User{},
        &model.Role{},
        &model.Permission{},
        &model.Shop{},
        &model.CustomerShop{},
        &domain.Token{},
    ); err != nil {
        return nil, err
    }
    return db, nil
}
