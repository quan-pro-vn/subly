package service

import (
	"errors"
	"time"

	"gorm.io/gorm"

	"metronic/internal/domain"
	"metronic/internal/model"
	"metronic/internal/repository"
	"metronic/internal/security"
)

// AuthService provides authentication methods based on opaque tokens
type AuthService struct {
	users  *repository.UserRepository
	tokens domain.TokenRepository
}

func NewAuthService(u *repository.UserRepository, t domain.TokenRepository) *AuthService {
	return &AuthService{users: u, tokens: t}
}

// Register creates a new user
func (s *AuthService) Register(email, password string) error {
	if _, err := s.users.FindByEmail(email); err == nil {
		return errors.New("email already exists")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	hash, err := security.HashPassword(password)
	if err != nil {
		return err
	}
	user := &model.User{Email: email, Password: hash}
	return s.users.Create(user)
}

// Login validates credentials and issues a new token
func (s *AuthService) Login(email, password, ip, ua string) (string, time.Time, *model.User, error) {
	user, err := s.users.FindByEmail(email)
	if err != nil || !security.CheckPassword(user.Password, password) {
		return "", time.Time{}, nil, errors.New("invalid credentials")
	}
	plain, hash, exp := security.GenerateToken()
	token := &domain.Token{
		UserID:    user.ID,
		TokenHash: hash,
		ExpiresAt: exp,
	}
	if ip != "" {
		token.IP = &ip
	}
	if ua != "" {
		token.UserAgent = &ua
	}
	if err := s.tokens.Create(token); err != nil {
		return "", time.Time{}, nil, err
	}
	return plain, exp, user, nil
}

// Refresh rotates the token and issues a new one
func (s *AuthService) Refresh(tokenStr, ip, ua string) (string, time.Time, *model.User, error) {
	hash := security.HashToken(tokenStr)
	stored, err := s.tokens.FindByHash(hash)
	if err != nil || stored.Revoked || stored.ExpiresAt.Before(time.Now()) {
		return "", time.Time{}, nil, errors.New("invalid token")
	}
	if err := s.tokens.RevokeByID(stored.ID); err != nil {
		return "", time.Time{}, nil, err
	}
	user, err := s.users.FindByID(stored.UserID)
	if err != nil {
		return "", time.Time{}, nil, err
	}
	plain, newHash, exp := security.GenerateToken()
	newToken := &domain.Token{
		UserID:    stored.UserID,
		TokenHash: newHash,
		ExpiresAt: exp,
	}
	if ip != "" {
		newToken.IP = &ip
	}
	if ua != "" {
		newToken.UserAgent = &ua
	}
	if err := s.tokens.Create(newToken); err != nil {
		return "", time.Time{}, nil, err
	}
	return plain, exp, user, nil
}

// Logout revokes token or all tokens
func (s *AuthService) Logout(tok *domain.Token, all bool) error {
	if all {
		return s.tokens.RevokeAllByUserID(tok.UserID)
	}
	return s.tokens.RevokeByID(tok.ID)
}

// Me returns current user by ID
func (s *AuthService) Me(userID uint) (*model.User, error) {
	return s.users.FindByID(userID)
}

// ChangePassword updates user password and revokes all tokens
func (s *AuthService) ChangePassword(userID uint, oldPwd, newPwd string) error {
	user, err := s.users.FindByID(userID)
	if err != nil {
		return err
	}
	if !security.CheckPassword(user.Password, oldPwd) {
		return errors.New("invalid credentials")
	}
	hash, err := security.HashPassword(newPwd)
	if err != nil {
		return err
	}
	user.Password = hash
	if err := s.users.Update(user); err != nil {
		return err
	}
	return s.tokens.RevokeAllByUserID(userID)
}
