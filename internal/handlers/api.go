package handlers

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

func Api(c *gin.Context) {
	db, err := sql.Open("sqlite3", "./../db/nodes.sqlite")

	if err != nil {
		panic(err)
	}

	defer db.Close()

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
