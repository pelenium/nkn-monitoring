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

		update := "UPDATE nodes_ip WHERE blocks_ever = ?, blocks_today = ? WHERE ip = ?"
		_, err = db.Exec(update, ever, today, ip)

		if err != nil {
			panic(err)
		}

		fmt.Println(ip + "\n" + ever + "\n" + today)
	}
}