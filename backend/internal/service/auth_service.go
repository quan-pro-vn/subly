package service

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"metronic/internal/model"
	"metronic/internal/repository"
	"metronic/internal/security"
)

// AuthService provides authentication methods
type AuthService struct {
	users  *repository.UserRepository
	tokens *repository.RefreshTokenRepository
	jwt    *security.JWTManager
}

func NewAuthService(u *repository.UserRepository, t *repository.RefreshTokenRepository, j *security.JWTManager) *AuthService {
	return &AuthService{users: u, tokens: t, jwt: j}
}

// Register creates new user
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

// Login validates credentials and issues tokens
func (s *AuthService) Login(email, password string) (string, string, error) {
	user, err := s.users.FindByEmail(email)
	if err != nil {
		return "", "", errors.New("invalid credentials")
	}
	if !security.CheckPassword(user.Password, password) {
		return "", "", errors.New("invalid credentials")
	}
	tokenID := uuid.NewString()
	access, err := s.jwt.GenerateAccessToken(user.ID)
	if err != nil {
		return "", "", err
	}
	refresh, err := s.jwt.GenerateRefreshToken(user.ID, tokenID)
	if err != nil {
		return "", "", err
	}
	rt := &model.RefreshToken{TokenID: tokenID, UserID: user.ID, ExpiresAt: time.Now().Add(s.jwt.RefreshTokenExp())}
	if err := s.tokens.Create(rt); err != nil {
		return "", "", err
	}
	return access, refresh, nil
}

// Refresh rotates refresh token and returns new tokens
func (s *AuthService) Refresh(tokenStr string) (string, string, error) {
	userID, tokenID, err := s.jwt.VerifyRefreshToken(tokenStr)
	if err != nil {
		return "", "", errors.New("invalid token")
	}
	stored, err := s.tokens.Get(tokenID)
	if err != nil || stored.UserID != userID || stored.ExpiresAt.Before(time.Now()) {
		return "", "", errors.New("invalid token")
	}
	// delete old token
	if err := s.tokens.Delete(tokenID); err != nil {
		return "", "", err
	}
	newID := uuid.NewString()
	access, err := s.jwt.GenerateAccessToken(userID)
	if err != nil {
		return "", "", err
	}
	refresh, err := s.jwt.GenerateRefreshToken(userID, newID)
	if err != nil {
		return "", "", err
	}
	rt := &model.RefreshToken{TokenID: newID, UserID: userID, ExpiresAt: time.Now().Add(s.jwt.RefreshTokenExp())}
	if err := s.tokens.Create(rt); err != nil {
		return "", "", err
	}
	return access, refresh, nil
}

// Logout removes refresh token
func (s *AuthService) Logout(tokenStr string) error {
	_, tokenID, err := s.jwt.VerifyRefreshToken(tokenStr)
	if err != nil {
		return errors.New("invalid token")
	}
	return s.tokens.Delete(tokenID)
}

// Me returns user info for the given access token
func (s *AuthService) Me(tokenStr string) (*model.User, error) {
	userID, err := s.jwt.VerifyAccessToken(tokenStr)
	if err != nil {
		return nil, errors.New("invalid token")
	}
	user, err := s.users.FindByID(userID)
	if err != nil {
		return nil, err
	}
	return user, nil
}
