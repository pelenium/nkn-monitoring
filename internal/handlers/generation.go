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
	exePath, err := os.Executable()
	if err != nil {
		// Обработка ошибки получения пути к исполняемому файлу
		c.String(http.StatusInternalServerError, "Internal Server Error")
		return
	}

	generationsPath := filepath.Join(filepath.Dir(exePath), "generations", generationName)
	fmt.Println(generationsPath)

	c.File(generationsPath)
}
