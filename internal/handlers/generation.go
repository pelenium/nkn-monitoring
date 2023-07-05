package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetGeneration(c *gin.Context) {
	generationName := c.Param("fileName")
	path := fmt.Sprintf("./../../generations/%s", generationName)
	fmt.Println(path)
	c.String(http.StatusOK, path)
}
