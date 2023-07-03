package handlers

import (
	"database/sql"
	"fmt"
	"io/ioutil"

	"github.com/gin-gonic/gin"
	"github.com/tidwall/gjson"
)

func Delete(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		req, err := ioutil.ReadAll(c.Request.Body)
		if err != nil {
			panic(err)
		}
		remove := "DELETE FROM nodes_ip WHERE ip = ?"
		ip := gjson.Get(string(req), "ip").String()
		fmt.Println(ip)
		db.Exec(remove, ip)
	}
}
