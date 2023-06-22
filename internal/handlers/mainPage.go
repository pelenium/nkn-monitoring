package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func MainPageGET(c *gin.Context) {
	c.String(http.StatusOK, "I'm alive")
}

func MainPagePOST(c *gin.Context) {
	
}