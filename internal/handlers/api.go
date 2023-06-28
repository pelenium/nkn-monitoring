package handlers

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type data struct {
	ip    string
	ever  int
	today int
}

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
			var info data
			err = rows.Scan(&info.ip, &info.ever, &info.today)
			if err != nil {
				panic(err)
			}
			result = append(result, info)
		}
		fmt.Println(result)
		c.JSON(http.StatusOK, result)
	}
}
