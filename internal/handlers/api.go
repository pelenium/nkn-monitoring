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

		rows, err := db.Query("SELECT ip FROM nodes_ip;")
		if err != nil {
			fmt.Println(err)
		}
		defer rows.Close()

		for rows.Next() {
			var ip string
			err = rows.Scan(&ip)
			if err != nil {
				fmt.Println(err)
			}
			data := map[string]interface{}{"ip": ip}

			result = append(result, data)
		}

		c.JSON(http.StatusOK, result)
	}
}
