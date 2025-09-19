package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds application configuration
type Config struct {
    DBDSN        string
    ClientOrigin string
    RateLimit    int
    SlackWebhook string
    Timezone     string
}

// Load reads configuration from environment variables and .env file
func Load() *Config {
	_ = godotenv.Load()

	rateLimit := getInt("AUTH_RATE_LIMIT", 5)

    cfg := &Config{
        DBDSN:        getEnv("DATABASE_DSN", ""),
        ClientOrigin: getEnv("CLIENT_ORIGIN", "*"),
        RateLimit:    rateLimit,
        SlackWebhook: getEnv("SLACK_WEBHOOK_URL", ""),
        Timezone:     getEnv("APP_TIMEZONE", "+07:00"),
    }
	return cfg
}

func getEnv(key, def string) string {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	return val
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
