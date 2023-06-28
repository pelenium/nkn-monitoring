package handlers

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tidwall/gjson"
)

func NodeIpGET(c *gin.Context) {
	c.HTML(http.StatusOK, "permissionDenied.html", gin.H{})
}

func NodeIpPOST(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		req := c.Request.Body
		jsn, err := ioutil.ReadAll(req)

		if err != nil {
			panic(err)
		}

		ip := gjson.Get(string(jsn), "ip").String()
		blocks_ever := gjson.Get(string(jsn), "blocks_ever").Int()
		blocks_today := gjson.Get(string(jsn), "blocks_today").Int()

		fmt.Println(ip)
		fmt.Println(blocks_ever)
		fmt.Println(blocks_today)

		if ip != "" {
			add := "INSERT INTO nodes_ip (ip, blocks_ever, blocks_today) values(?, ?, ?)"

			var notExists bool

			err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM nodes_ip WHERE ip = ?)`, ip).Scan(&notExists)

			if err != nil {
				panic(err)
			}

			if !notExists {
				fmt.Println("there no node with such ip")
				_, err = db.Exec(add, ip, blocks_ever, blocks_today)

				if err != nil {
					panic(err)
				}
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
		}
	}
}