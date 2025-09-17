package model

import (
    "crypto/rand"
    "fmt"
    "time"

    "gorm.io/gorm"
)

// Shop represents a tenant/shop entity
type Shop struct {
    ID        uint       `gorm:"primaryKey" json:"id"`
    UUID      string     `gorm:"type:char(36);uniqueIndex" json:"uuid"`
    Name      string     `gorm:"size:255" json:"name"`
    Domain    string     `gorm:"uniqueIndex;size:255" json:"domain"`
    Active    bool       `gorm:"default:true" json:"active"`
    ExpiredAt *time.Time `json:"expired_at"`
    CreatedAt time.Time  `json:"-"`
    UpdatedAt time.Time  `json:"-"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate hook to ensure UUID is populated
func (s *Shop) BeforeCreate(tx *gorm.DB) error {
    if s.UUID == "" {
        u, err := generateUUIDv4()
        if err != nil {
            return err
        }
        s.UUID = u
    }
    return nil
}

// generateUUIDv4 returns a RFC 4122 UUIDv4 string without external deps
func generateUUIDv4() (string, error) {
    b := make([]byte, 16)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    // Set version (4) and variant (RFC4122)
    b[6] = (b[6] & 0x0f) | 0x40
    b[8] = (b[8] & 0x3f) | 0x80
    return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16]), nil
}
