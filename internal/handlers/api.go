package handlers

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Api(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := []interface{}{}

		rows, err := db.Query("SELECT ip, blocks_ever, blocks_today FROM nodes_ip;")
		if err != nil {
			fmt.Println(err)
		}
		defer rows.Close()
		
		for rows.Next() {
			var ip string
			var blocks_ever, blocks_today int
			err = rows.Scan(&ip, &blocks_ever, &blocks_today)
			if err != nil {
				fmt.Println(err)
			}
			data := []interface{}{ip, blocks_ever, blocks_today}

			result = append(result, data)
		}
		fmt.Println(result)
		c.JSON(http.StatusOK, result)
	}
}
