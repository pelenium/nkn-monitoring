package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
)

type nodeInfo struct {
	generation  int
	ip          string
	height      string
	version     string
	work_time   string
	mined_ever  string
	mined_today string
	node_status string
	lbn         string
	lu          string
}

func ApiGET(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := []nodeInfo{}

		rows, err := db.Query("SELECT * FROM nodes_ip;")
		if err != nil {
			fmt.Println(err)
		}
		defer rows.Close()

		for rows.Next() {
			var node nodeInfo
			err = rows.Scan(&node.ip, &node.generation, &node.height, &node.version, &node.work_time, &node.mined_ever, &node.mined_today, &node.node_status, &node.lbn, &node.lu)
			if err != nil {
				fmt.Println(err)
			}

			result = append(result, node)
		}

		sort.Slice(result, func(i, j int) bool {
			return result[i].generation > result[j].generation
		})

		c.JSON(http.StatusOK, result)
	}
}
