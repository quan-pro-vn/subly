package service

import (
    "metronic/internal/model"
    "metronic/internal/repository"
)

// CustomerService provides read-only access to customers
type CustomerService struct {
    customers *repository.CustomerRepository
}

func NewCustomerService(r *repository.CustomerRepository) *CustomerService {
    return &CustomerService{customers: r}
}

func (s *CustomerService) List() ([]model.Customer, error) {
    return s.customers.List()
}

func (s *CustomerService) Get(id uint) (*model.Customer, error) {
    return s.customers.FindByID(id)
}

