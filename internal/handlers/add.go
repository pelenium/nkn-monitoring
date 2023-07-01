package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Add(c *gin.Context) {
	c.HTML(http.StatusOK, "addIp.html", gin.H{})
}