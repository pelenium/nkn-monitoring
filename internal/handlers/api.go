package handlers

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ApiGET(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := []interface{}{}

		rows, err := db.Query("SELECT ip, generation, height, version, work_time, mined_ever, mined_today, node_status FROM nodes_ip;")
		if err != nil {
			fmt.Println(err)
		}
		defer rows.Close()

		for rows.Next() {
			var ip string
			var generation int
			var height, version, work_time, mined_ever, mined_today, node_status string
			err = rows.Scan(&ip, &generation, &height, &version, &work_time, &mined_ever, &mined_today, &node_status)
			if err != nil {
				fmt.Println(err)
			}
			data := map[string]interface{}{
				"ip":          ip,
				"generation":  generation,
				"height":      height,
				"version":     version,
				"work_time":   work_time,
				"mined_ever":  mined_ever,
				"mined_today": mined_today,
				"node_status": node_status,
			}

			result = append(result, data)
		}

		c.JSON(http.StatusOK, result)
	}
}
