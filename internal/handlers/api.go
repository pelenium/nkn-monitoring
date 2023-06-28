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

		req := `SELECT * FROM nodes_ip`

		rows, err := db.Query(req)
		if err != nil {
			panic(err)
		}
		defer rows.Close()

		for rows.Next() {
			var ip string
			var ever, today int
			err = rows.Scan(&ip, &ever, &today)
			if err != nil {
				panic(err)
			}
			data := []interface{}{}
			data = append(data, ip)
			data = append(data, ever)
			data = append(data, today)
			result = append(result, data)
		}
		fmt.Println(result)
		c.JSON(http.StatusOK, result)
	}
}
