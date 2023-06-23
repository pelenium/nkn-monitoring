package handlers

import (
	"database/sql"
	"io/ioutil"

	"github.com/gin-gonic/gin"
	"github.com/tidwall/gjson"
)

func NodeIpGet(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		req := c.Request.Body
		jsn, err := ioutil.ReadAll(req)

		if err != nil {
			panic(err)
		}

		ip := gjson.Get(string(jsn), "ip").String()

		if ip != "" {
			add := "INSERT INTO nodes_ip (ip) values(?)"
			remove := "DELETE FROM nodes_ip WHERE ip=?"

			requestType := gjson.Get(string(jsn), "type").String()

			if requestType == "add" {
				_, err = db.Exec(add, ip)
				if err != nil {
					panic(err)
				}
			} else {
				_, err = db.Exec(remove, ip)
				if err != nil {
					panic(err)
				}
			}
		}
	}
}
