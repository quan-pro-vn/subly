package repository

import (
	"metronic/internal/model"

	"gorm.io/gorm"
)

// UserRepository handles user persistence
type UserRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *model.User) error {
    return r.db.Create(user).Error
}

func (r *UserRepository) List() ([]model.User, error) {
    var users []model.User
    if err := r.db.Preload("Roles").Order("id DESC").Find(&users).Error; err != nil {
        return nil, err
    }
    return users, nil
}

func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
    var user model.User
    if err := r.db.Preload("Roles").Where("email = ?", email).First(&user).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *UserRepository) FindByID(id uint) (*model.User, error) {
    var user model.User
    if err := r.db.Preload("Roles").First(&user, id).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *UserRepository) Update(user *model.User) error {
    return r.db.Save(user).Error
}

func (r *UserRepository) DeleteByID(id uint) error {
    return r.db.Delete(&model.User{}, id).Error
}
