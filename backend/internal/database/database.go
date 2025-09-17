package database

import (
    "log"
    "os"
    "time"

    "gorm.io/driver/mysql"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"

    "metronic/internal/domain"
    "metronic/internal/model"
)

// Connect opens database connection and migrates models

func Connect(dsn string) (*gorm.DB, error) {
    // Enable verbose SQL logging to stdout for development
    newLogger := logger.New(
        log.New(os.Stdout, "[gorm] ", log.LstdFlags),
        logger.Config{
            SlowThreshold:             200 * time.Millisecond,
            LogLevel:                  logger.Info, // SQL + bind vars
            IgnoreRecordNotFoundError: true,
            Colorful:                  false,
        },
    )

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{Logger: newLogger})
	if err != nil {
		return nil, err
	}
    if err := db.AutoMigrate(
        &model.User{},
        &model.Role{},
        &model.Permission{},
        &model.Shop{},
        &model.ShopRenewal{},
        &model.ShopAPILog{},
        &model.CustomerShop{},
        &domain.Token{},
    ); err != nil {
        return nil, err
    }
    return db, nil
}
