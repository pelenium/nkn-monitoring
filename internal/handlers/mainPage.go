package handlers

import (
	"database/sql"
	"fmt"
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
				rows, err := db.Query("SELECT * FROM nodes_ip")
				if err != nil {
					panic(err)
				}
				defer rows.Close()
				cols, err := rows.Columns()
				if err != nil {
					panic(err)
				}
				all_ips := make([]interface{}, len(cols))
				for i := range cols {
					all_ips[i] = new(interface{})
				}
				for rows.Next() {
					err = rows.Scan(all_ips...)
					if err != nil {
						panic(err)
					}
			
					for i, column := range cols {
						val := *(all_ips[i].(*interface{}))
						fmt.Println(column, val)
					}
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
