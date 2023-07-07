package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
)

type nodeData struct {
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
	lo          string
}

func ApiGET(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := []map[string]interface{}{}

		rows, err := db.Query("SELECT * FROM nodes_ip;")
		if err != nil {
			fmt.Println(err)
		}
		defer rows.Close()

		for rows.Next() {
			var node nodeData
			err = rows.Scan(&node.ip, &node.generation, &node.height, &node.version, &node.work_time, &node.mined_ever, &node.mined_today, &node.node_status, &node.lbn, &node.lu, &node.lo)
			if err != nil {
				fmt.Println(err)
			}
			data := map[string]interface{}{
				"ip":          node.ip,
				"generation":  node.generation,
				"height":      node.height,
				"version":     node.version,
				"work_time":   node.work_time,
				"mined_ever":  node.mined_ever,
				"mined_today": node.mined_today,
				"node_status": node.node_status,
			}

			result = append(result, data)
		}

		sort.Slice(result, func(i, j int) bool {
			return result[i]["generation"].(int) < result[j]["generation"].(int)
		})

		c.JSON(http.StatusOK, result)
	}
}
