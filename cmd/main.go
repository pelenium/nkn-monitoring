package main

import (
	"monitoring/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.LoadHTMLGlob("./../internal/html/*.html")

	router.GET("/", handlers.MainPageGET)

	router.POST("/", handlers.MainPagePOST)

	router.Run(":9999")
}