package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"metronic/internal/config"
	"metronic/internal/database"
	"metronic/internal/handler"
	"metronic/internal/middleware"
	"metronic/internal/repository"
	"metronic/internal/security"
	"metronic/internal/service"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DBDSN)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	tokenRepo := repository.NewRefreshTokenRepository(db)
	jwt := security.NewJWTManager(cfg.JWTSecret, cfg.RefreshSecret, cfg.AccessTokenExpiry, cfg.RefreshTokenExpiry)
	authService := service.NewAuthService(userRepo, tokenRepo, jwt)
	authHandler := handler.NewAuthHandler(authService)

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	corsCfg := cors.Config{
		AllowOrigins:     []string{cfg.ClientOrigin},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}
	r.Use(cors.New(corsCfg))

	authGroup := r.Group("/api/auth")
	authGroup.Use(middleware.RateLimit(cfg.RateLimit))
	authGroup.POST("/register", authHandler.Register)
	authGroup.POST("/login", authHandler.Login)
	authGroup.POST("/refresh", authHandler.Refresh)
	authGroup.POST("/logout", authHandler.Logout)
	authGroup.GET("/me", authHandler.Me)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server: %v", err)
	}
}
