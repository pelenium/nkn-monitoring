package handlers

import (
	"database/sql"
	"fmt"
	"io/ioutil"

	"github.com/gin-gonic/gin"
)

func Update(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		req, err := ioutil.ReadAll(c.Request.Body)

		if (err != nil) {
			panic(err)
		}

		fmt.Println(string(req))
	}
}