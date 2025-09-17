package service

import (
    "errors"
    "time"

    "gorm.io/gorm"

    "metronic/internal/model"
    "metronic/internal/repository"
)

// ShopService encapsulates business logic for shops
type ShopService struct {
    shops *repository.ShopRepository
    renewals *repository.ShopRenewalRepository
}

func NewShopService(r *repository.ShopRepository) *ShopService {
    return &ShopService{shops: r}
}

func (s *ShopService) Create(domain string, expiredAt *time.Time, pricePerCycle int, cycleMonths int) (*model.Shop, error) {
    // Ensure unique domain
    if _, err := s.shops.FindByDomain(domain); err == nil {
        return nil, errors.New("domain already exists")
    } else if !errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, err
    }
    if pricePerCycle <= 0 {
        pricePerCycle = 2000000
    }
    if cycleMonths <= 0 {
        cycleMonths = 12
    }
    m := &model.Shop{Domain: domain, Active: true, ExpiredAt: expiredAt, PricePerCycle: pricePerCycle, CycleMonths: cycleMonths}
    if err := s.shops.Create(m); err != nil {
        return nil, err
    }
    return m, nil
}

func (s *ShopService) List() ([]model.Shop, error) {
    return s.shops.List()
}

// ListPaged returns shops for a specific page and limit plus total count
func (s *ShopService) ListPaged(page, limit int) ([]model.Shop, int64, error) {
    return s.shops.ListPaged(page, limit)
}

// ListPagedFiltered returns filtered page of shops plus total
func (s *ShopService) ListPagedFiltered(page, limit int, filter string) ([]model.Shop, int64, error) {
    now := time.Now()
    return s.shops.ListPagedFiltered(page, limit, filter, now)
}

// ShopStats mirrors repository stats
type ShopStats struct {
    All       int64 `json:"all"`
    Valid     int64 `json:"valid"`
    Expired   int64 `json:"expired"`
    NotOver1y int64 `json:"notOver1y"`
    Expiring  int64 `json:"expiring"`
    Trashed   int64 `json:"trashed"`
}

func (s *ShopService) Stats() (ShopStats, error) {
    now := time.Now()
    rstats, err := s.shops.Stats(now)
    if err != nil {
        return ShopStats{}, err
    }
    return ShopStats{
        All:       rstats.All,
        Valid:     rstats.Valid,
        Expired:   rstats.Expired,
        NotOver1y: rstats.NotOver1y,
        Expiring:  rstats.Expiring,
        Trashed:   rstats.Trashed,
    }, nil
}

// Restore brings back a soft-deleted shop
func (s *ShopService) Restore(id uint) error {
    return s.shops.RestoreByID(id)
}

// ForceDelete permanently deletes a shop
func (s *ShopService) ForceDelete(id uint) error {
    return s.shops.ForceDeleteByID(id)
}

func (s *ShopService) Get(id uint) (*model.Shop, error) {
    return s.shops.FindByID(id)
}

func (s *ShopService) FindByUUID(uuid string) (*model.Shop, error) {
    return s.shops.FindByUUID(uuid)
}

func (s *ShopService) FindByDomain(domain string) (*model.Shop, error) {
    return s.shops.FindByDomain(domain)
}

func (s *ShopService) Update(id uint, domain string, expiredAt *time.Time) (*model.Shop, error) {
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
    // Do not modify ExpiredAt unless explicitly provided (nil means keep current)
    if expiredAt != nil {
        m.ExpiredAt = expiredAt
    }
    // price/cycle are updated via specialized method to keep signature minimal
    if err := s.shops.Update(m); err != nil {
        return nil, err
    }
    return m, nil
}

// UpdateBilling updates price per cycle and cycle months
func (s *ShopService) UpdateBilling(id uint, pricePerCycle, cycleMonths *int) (*model.Shop, error) {
    m, err := s.shops.FindByID(id)
    if err != nil {
        return nil, err
    }
    if pricePerCycle != nil && *pricePerCycle > 0 {
        m.PricePerCycle = *pricePerCycle
    }
    if cycleMonths != nil && *cycleMonths > 0 {
        m.CycleMonths = *cycleMonths
    }
    if err := s.shops.Update(m); err != nil {
        return nil, err
    }
    return m, nil
}

func (s *ShopService) Delete(id uint) error {
    return s.shops.DeleteByID(id)
}

// WithRenewalRepo injects the renewal repository (optional wiring style)
func (s *ShopService) WithRenewalRepo(rr *repository.ShopRenewalRepository) *ShopService {
    s.renewals = rr
    return s
}

// Renew extends shop expiration by given months and records history
func (s *ShopService) Renew(shopID uint, months int, performedBy uint, note *string) (*model.Shop, *model.ShopRenewal, error) {
    if months <= 0 {
        return nil, nil, errors.New("months must be > 0")
    }
    m, err := s.shops.FindByID(shopID)
    if err != nil {
        return nil, nil, err
    }
    now := time.Now()
    var base time.Time
    if m.ExpiredAt != nil && m.ExpiredAt.After(now) {
        base = *m.ExpiredAt
    } else {
        base = now
    }
    newExp := addMonths(base, months)
    old := m.ExpiredAt
    m.ExpiredAt = &newExp
    if err := s.shops.Update(m); err != nil {
        return nil, nil, err
    }
    rec := &model.ShopRenewal{
        ShopID:      m.ID,
        Months:      months,
        OldExpiredAt: old,
        NewExpiredAt: newExp,
        Note:        note,
        PerformedBy: performedBy,
    }
    if s.renewals != nil {
        if err := s.renewals.Create(rec); err != nil {
            return nil, nil, err
        }
    }
    return m, rec, nil
}

// RenewToDate sets new expiration to target date and records months approximated
func (s *ShopService) RenewToDate(shopID uint, target time.Time, performedBy uint, note *string) (*model.Shop, *model.ShopRenewal, error) {
    m, err := s.shops.FindByID(shopID)
    if err != nil {
        return nil, nil, err
    }
    now := time.Now()
    var base time.Time
    if m.ExpiredAt != nil && m.ExpiredAt.After(now) {
        base = *m.ExpiredAt
    } else {
        base = now
    }
    // normalize target to same location as base
    target = time.Date(target.Year(), target.Month(), target.Day(), base.Hour(), base.Minute(), base.Second(), base.Nanosecond(), base.Location())
    if !target.After(base) {
        return nil, nil, errors.New("target must be after current expiry or now")
    }
    // approximate months between base and target
    months := (int(target.Year())-int(base.Year()))*12 + (int(target.Month()) - int(base.Month()))
    // ensure addMonths(base, months) >= target; bump if needed
    if addMonths(base, months).Before(target) {
        months++
    }
    old := m.ExpiredAt
    m.ExpiredAt = &target
    if err := s.shops.Update(m); err != nil {
        return nil, nil, err
    }
    rec := &model.ShopRenewal{
        ShopID:      m.ID,
        Months:      months,
        OldExpiredAt: old,
        NewExpiredAt: target,
        Note:        note,
        PerformedBy: performedBy,
    }
    if s.renewals != nil {
        if err := s.renewals.Create(rec); err != nil {
            return nil, nil, err
        }
    }
    return m, rec, nil
}

// addMonths adds n months to t, keeping day-of-month reasonably
func addMonths(t time.Time, n int) time.Time {
    y, m, d := t.Date()
    // Convert to 1-based month int
    mi := int(m)
    mi += n
    for mi > 12 {
        y++
        mi -= 12
    }
    for mi <= 0 {
        y--
        mi += 12
    }
    // Clamp day to end of month
    firstOfNext := time.Date(y, time.Month(mi)+1, 1, 0, 0, 0, 0, t.Location())
    lastDay := firstOfNext.Add(-24 * time.Hour).Day()
    if d > lastDay {
        d = lastDay
    }
    return time.Date(y, time.Month(mi), d, t.Hour(), t.Minute(), t.Second(), t.Nanosecond(), t.Location())
}

// ListRenewals returns renewal records for a shop (newest first)
func (s *ShopService) ListRenewals(shopID uint) ([]model.ShopRenewal, error) {
    if s.renewals == nil {
        return []model.ShopRenewal{}, nil
    }
    return s.renewals.ListByShopID(shopID)
}
