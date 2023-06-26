package handlers

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Api(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := []string{}

		req := `SELECT * FROM nodes_ip`

		rows, err := db.Query(req)
		if err != nil {
			panic(err)
		}
		defer rows.Close()

		for rows.Next() {
			var value string
			err = rows.Scan(&value)
			if err != nil {
				panic(err)
			}
			result = append(result, value)
		}
		fmt.Println(result)
		c.JSON(http.StatusOK, result)
	}
}
