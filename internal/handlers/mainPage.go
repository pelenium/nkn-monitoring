package handlers

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/tidwall/gjson"
)

func PermissionDenied(c *gin.Context) {
	c.HTML(http.StatusOK, "permissionDenied.html", gin.H{})
}

func NodeIpPOST(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		req := c.Request.Body
		jsn, err := ioutil.ReadAll(req)

		if err != nil {
			panic(err)
		}

		ip := strings.TrimSpace(gjson.Get(string(jsn), "ip").String())
		fmt.Println(ip)
		generation, err := strconv.Atoi(strings.TrimSpace(gjson.Get(string(jsn), "generation").String()))

		if generation == 0 {
			generation++
		}

		if err != nil {
			panic(err)
		}

		fmt.Println(generation)

		if ip != "" {
			var isGenerationFree bool
		repeat:
			err = db.QueryRow(`SELECT EXISTS(SELECT 1 FROM nodes_ip WHERE generation = ?)`, generation).Scan(&isGenerationFree)
			if err != nil {
				panic(err)
			}
			if isGenerationFree {
				fmt.Println("this generation isn't avaliable")
				generation++
				goto repeat
			}

			if ip != "" {
				add := "INSERT INTO nodes_ip (ip, generation, height, version, work_time, mined_ever, mined_today, node_status, last_block_number, last_update) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

				var exists bool

				err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM nodes_ip WHERE ip = ?)`, ip).Scan(&exists)

				if err != nil {
					panic(err)
				}

				if exists {
					fmt.Println("there's such ip")
				} else {
					fmt.Println("there no node with such ip")
					_, err = db.Exec(add, ip, generation, "-", "-", "-", "-", "-", "-", "OFFLINE", "-", "-")

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
					fmt.Println()
				}
			}
			c.JSON(http.StatusOK, gin.H{})
		}
	}
}
