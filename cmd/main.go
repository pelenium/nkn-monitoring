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

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS nodes_ip 
		(ip TEXT NOT NULL, 
		generation INT NOT NULL, 
		height TEXT NOT NULL,
		version TEXT NOT NULL,
		work_time TEXT NOT NULL,
		mined_ever TEXT NOT NULL,
		mined_today TEXT NOT NULL,
		node_status TEXT NOT NULL,
		last_block_number TEXT NOT NULL,
		last_update TEXT NOT NULL);`)

	if err != nil {
		panic(err)
	}

	defer db.Close()

	go update(db)

	router.Static("../internal/static", "./../internal/static")
	router.LoadHTMLGlob("./../internal/html/*.html")

	router.GET("/", handlers.PermissionDenied)
	router.POST("/", handlers.NodeIpPOST(db))

	router.POST("/delete", handlers.Delete(db))

	router.GET("/api", handlers.ApiGET(db))

	router.GET("/generations/:fileName", handlers.GetGeneration)

	router.GET("/my-nodes", handlers.MyNodesGET)

	router.Run(":9999")
}
