package handlers

import (
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetGenerationNumber(c *gin.Context) {
	dir := "/root/nkn-monitoring/generations/"

	files, err := ioutil.ReadDir(dir)
	if err != nil {
		panic(err)
	}

	count := 0
	for _, file := range files {
		if file.Mode().IsRegular() {
			count++
		}
	}

	c.JSON(http.StatusOK, gin.H{"number": count})
}
