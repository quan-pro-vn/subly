package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"metronic/internal/config"
	"metronic/internal/database"
	"metronic/internal/domain"
	"metronic/internal/handler"
	"metronic/internal/repository"
	route "metronic/internal/route"
	"metronic/internal/service"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DBDSN)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	tokenRepo := repository.NewTokenRepository(db)
	authService := service.NewAuthService(userRepo, tokenRepo)
	authHandler := handler.NewAuthHandler(authService)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
		AllowAllOrigins:  true,
	}))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	setUpRouter(r, authHandler, tokenRepo)

	fmt.Println("Server running at :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("server: %v", err)
	}
}

func setUpRouter(r *gin.Engine, h *handler.AuthHandler, tokens domain.TokenRepository) {
	apiRouter := r.Group("/api")
	route.AuthRouter(apiRouter, h, tokens)
}
