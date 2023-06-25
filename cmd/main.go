package main

import (
	"database/sql"
	"monitoring/internal/handlers"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	router := gin.Default()

	db, err := sql.Open("sqlite3", "./../internal/db/nodes.sqlite")

	if err != nil {
		panic(err)
	}

	_, err = db.Exec(
		`
		CREATE TABLE IF NOT EXISTS nodes_ip 
		(ip TEXT NOT NULL PRIMARY KEY,
		latest_block_height INT,
		node_status TEXT); DELETE FROM nodes_ip;
		`)

	if err != nil {
		panic(err)
	}

	router.LoadHTMLGlob("./../internal/html/*.html")

	router.GET("/", handlers.NodeIpGET)
	router.POST("/", handlers.NodeIpPOST(db))

	router.GET("/my-nodes", handlers.MyNodesGET)

	router.Run(":9999")

	db.Close()
}
