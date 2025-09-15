package model

import "time"

// Customer is a read-only projection onto the legacy `users` table
// that stores customer contacts imported from an external system.
// We intentionally omit authentication fields like Password.
type Customer struct {
	ID        uint       `json:"id"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	Phone     string     `json:"phone"`
	Note      *string    `json:"note"`
	CreatedAt *time.Time `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
}

// TableName maps the model to the existing `users` table
func (Customer) TableName() string { return "customers" }
