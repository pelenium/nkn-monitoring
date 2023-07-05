package handlers

import (
	"fmt"
	"net/http"
	_ "net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func GetGeneration(c *gin.Context) {
	generationName := c.Param("fileName")
	generationsPath :=  fmt.Sprintf("/root/nkn-monitoring/generations/%s", generationName)
	fmt.Println(generationsPath)
	c.File(generationsPath)
}
