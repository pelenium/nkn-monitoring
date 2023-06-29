package handlers

import (
	"database/sql"
	"fmt"
	"io/ioutil"

	"github.com/gin-gonic/gin"
	"github.com/tidwall/gjson"
)

func Update(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		req, err := ioutil.ReadAll(c.Request.Body)
		if err != nil {
			panic(err)
		}

		ip := gjson.Get(string(req), "ip").String()
		ever := gjson.Get(string(req), "blocks_ever").String()
		today := gjson.Get(string(req), "blocks_today").String()

		fmt.Println(ip, "\n", ever, "\n", today)
	}
}