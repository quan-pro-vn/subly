package service

import (
    "errors"

    "gorm.io/gorm"

    "metronic/internal/model"
    "metronic/internal/repository"
)

// ShopService encapsulates business logic for shops
type ShopService struct {
    shops *repository.ShopRepository
}

func NewShopService(r *repository.ShopRepository) *ShopService {
    return &ShopService{shops: r}
}

func (s *ShopService) Create(name, domain string, active bool) (*model.Shop, error) {
    // Ensure unique domain
    if _, err := s.shops.FindByDomain(domain); err == nil {
        return nil, errors.New("domain already exists")
    } else if !errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, err
    }
    m := &model.Shop{Name: name, Domain: domain, Active: active}
    if err := s.shops.Create(m); err != nil {
        return nil, err
    }
    return m, nil
}

func (s *ShopService) List() ([]model.Shop, error) {
    return s.shops.List()
}

func (s *ShopService) Get(id uint) (*model.Shop, error) {
    return s.shops.FindByID(id)
}

func (s *ShopService) Update(id uint, name, domain string, active *bool) (*model.Shop, error) {
    m, err := s.shops.FindByID(id)
    if err != nil {
        return nil, err
    }
    if domain != "" && domain != m.Domain {
        if _, err := s.shops.FindByDomain(domain); err == nil {
            return nil, errors.New("domain already exists")
        } else if !errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, err
        }
        m.Domain = domain
    }
    if name != "" {
        m.Name = name
    }
    if active != nil {
        m.Active = *active
    }
    if err := s.shops.Update(m); err != nil {
        return nil, err
    }
    return m, nil
}

func (s *ShopService) Delete(id uint) error {
    return s.shops.DeleteByID(id)
}

