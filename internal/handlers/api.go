package handlers

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type data struct {
	ip    string
	blocks_ever  int
	blocks_today int
}

func Api(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := []data{}

		req := `SELECT ip, blocks_ever, blocks_today FROM nodes_ip`

		rows, err := db.Query(req)
		if err != nil {
			panic(err)
		}
		defer rows.Close()

		for rows.Next() {
			var info data
			err = rows.Scan(&info.ip, &info.blocks_ever, &info.blocks_today)
			if err != nil {
				panic(err)
			}
			fmt.Println(info)
			result = append(result, info)
		}
		fmt.Println(result)
		c.JSON(http.StatusOK, result)
	}
}
