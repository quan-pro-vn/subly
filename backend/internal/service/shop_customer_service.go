package service

import "metronic/internal/repository"

// ShopCustomerService manages customer assignments to shops
type ShopCustomerService struct {
    custShop *repository.CustomerShopRepository
}

func NewShopCustomerService(r *repository.CustomerShopRepository) *ShopCustomerService {
    return &ShopCustomerService{custShop: r}
}

func (s *ShopCustomerService) Assign(shopUUID string, userID uint, role string, isOwner bool) error {
    return s.custShop.Add(shopUUID, userID, role, isOwner)
}

func (s *ShopCustomerService) Remove(shopUUID string, userID uint) error {
    return s.custShop.Remove(shopUUID, userID)
}

