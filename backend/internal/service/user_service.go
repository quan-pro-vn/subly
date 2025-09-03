package service

import (
    "errors"

    "gorm.io/gorm"

    "metronic/internal/model"
    "metronic/internal/repository"
    "metronic/internal/security"
)

// UserService encapsulates business logic for users
type UserService struct {
    users *repository.UserRepository
}

func NewUserService(u *repository.UserRepository) *UserService {
    return &UserService{users: u}
}

// Create creates a new user with hashed password
func (s *UserService) Create(name, email, password string) (*model.User, error) {
    if _, err := s.users.FindByEmail(email); err == nil {
        return nil, errors.New("email already exists")
    } else if !errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, err
    }
    hash, err := security.HashPassword(password)
    if err != nil {
        return nil, err
    }
    u := &model.User{Name: name, Email: email, Password: hash}
    if err := s.users.Create(u); err != nil {
        return nil, err
    }
    return u, nil
}

// List returns all users
func (s *UserService) List() ([]model.User, error) {
    return s.users.List()
}

// Get returns user by ID
func (s *UserService) Get(id uint) (*model.User, error) {
    return s.users.FindByID(id)
}

// Update updates user info; if password non-empty, re-hash
func (s *UserService) Update(id uint, name, email, password string) (*model.User, error) {
    u, err := s.users.FindByID(id)
    if err != nil {
        return nil, err
    }
    // Ensure email uniqueness if changed
    if email != "" && email != u.Email {
        if _, err := s.users.FindByEmail(email); err == nil {
            return nil, errors.New("email already exists")
        } else if !errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, err
        }
        u.Email = email
    }
    if name != "" {
        u.Name = name
    }
    if password != "" {
        hash, err := security.HashPassword(password)
        if err != nil {
            return nil, err
        }
        u.Password = hash
    }
    if err := s.users.Update(u); err != nil {
        return nil, err
    }
    return u, nil
}

// Delete removes user by ID
func (s *UserService) Delete(id uint) error {
    return s.users.DeleteByID(id)
}

