package security

import "golang.org/x/crypto/bcrypt"

// HashPassword hashes password using bcrypt
func HashPassword(pw string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword compares hashed password with plain password
func CheckPassword(hash, pw string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw))
	return err == nil
}
