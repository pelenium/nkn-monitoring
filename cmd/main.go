package main

import (
	"monitoring/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/", handlers.MainPageGET)

	router.Run(":9999")
}