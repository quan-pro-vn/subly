package security

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTManager handles JWT generation and verification
type JWTManager struct {
	secret          string
	refreshSecret   string
	accessTokenExp  time.Duration
	refreshTokenExp time.Duration
}

// NewJWTManager creates JWT manager
func NewJWTManager(secret, refreshSecret string, accessExp, refreshExp time.Duration) *JWTManager {
	return &JWTManager{secret: secret, refreshSecret: refreshSecret, accessTokenExp: accessExp, refreshTokenExp: refreshExp}
}

// GenerateAccessToken generates access token
func (j *JWTManager) GenerateAccessToken(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(j.accessTokenExp).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secret))
}

// GenerateRefreshToken generates refresh token with given tokenID
func (j *JWTManager) GenerateRefreshToken(userID uint, tokenID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"jti": tokenID,
		"exp": time.Now().Add(j.refreshTokenExp).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.refreshSecret))
}

// VerifyAccessToken verifies token and returns userID
func (j *JWTManager) VerifyAccessToken(tokenStr string) (uint, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(j.secret), nil
	})
	if err != nil || !token.Valid {
		return 0, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("invalid claims")
	}
	sub, ok := claims["sub"].(float64)
	if !ok {
		return 0, errors.New("invalid subject")
	}
	return uint(sub), nil
}

// VerifyRefreshToken verifies refresh token and returns userID and tokenID
func (j *JWTManager) VerifyRefreshToken(tokenStr string) (uint, string, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(j.refreshSecret), nil
	})
	if err != nil || !token.Valid {
		return 0, "", err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, "", errors.New("invalid claims")
	}
	sub, ok := claims["sub"].(float64)
	if !ok {
		return 0, "", errors.New("invalid subject")
	}
	jti, ok := claims["jti"].(string)
	if !ok {
		return 0, "", errors.New("invalid jti")
	}
	return uint(sub), jti, nil
}

// RefreshTokenExp returns refresh token duration
func (j *JWTManager) RefreshTokenExp() time.Duration {
	return j.refreshTokenExp
}

// AccessTokenExp returns access token duration
func (j *JWTManager) AccessTokenExp() time.Duration {
	return j.accessTokenExp
}
