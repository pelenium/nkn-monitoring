package handlers

import (
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
)

func MainPageGET(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", gin.H{})
}

func MainPagePOST(c *gin.Context) {
	req := c.Request.Body
	jsn, err := ioutil.ReadAll(req)
	if err != nil {
		panic(err)
	}
	c.JSON(http.StatusOK, string(jsn))
}