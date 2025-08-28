package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config holds application configuration
type Config struct {
	DBDSN              string
	JWTSecret          string
	RefreshSecret      string
	AccessTokenExpiry  time.Duration
	RefreshTokenExpiry time.Duration
	ClientOrigin       string
	RateLimit          int
}

// Load reads configuration from environment variables and .env file
func Load() *Config {
	_ = godotenv.Load()

	accessExp := getDuration("ACCESS_TOKEN_EXPIRY", 15*time.Minute)
	refreshExp := getDuration("REFRESH_TOKEN_EXPIRY", 7*24*time.Hour)
	rateLimit := getInt("AUTH_RATE_LIMIT", 5)

	cfg := &Config{
		DBDSN:              getEnv("DATABASE_DSN", ""),
		JWTSecret:          mustEnv("JWT_SECRET"),
		RefreshSecret:      mustEnv("REFRESH_SECRET"),
		AccessTokenExpiry:  accessExp,
		RefreshTokenExpiry: refreshExp,
		ClientOrigin:       getEnv("CLIENT_ORIGIN", "*"),
		RateLimit:          rateLimit,
	}
	return cfg
}

func mustEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("environment variable %s required", key)
	}
	return val
}

func getEnv(key, def string) string {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	return val
}

func getDuration(key string, def time.Duration) time.Duration {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	d, err := time.ParseDuration(val)
	if err != nil {
		return def
	}
	return d
}

func getInt(key string, def int) int {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	i, err := strconv.Atoi(val)
	if err != nil {
		return def
	}
	return i
}
