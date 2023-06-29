package main

import (
	"database/sql"
	"github.com/gin-contrib/cors"
	"monitoring/internal/handlers"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://194.146.39.188:9999"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type"}

	router.Use(cors.New(config))

	db, err := sql.Open("sqlite3", "./../internal/db/nodes.sqlite")

	if err != nil {
		panic(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS nodes_ip (ip TEXT NOT NULL);`)

	if err != nil {
		panic(err)
	}

	defer db.Close()

	router.Static("../internal/static", "./../internal/static")
	router.LoadHTMLGlob("./../internal/html/*.html")

	router.GET("/", handlers.PermissionDenied)
	router.POST("/", handlers.NodeIpPOST(db))

	router.GET("/api", handlers.ApiGET(db))

	router.GET("/my-nodes", handlers.MyNodesGET)

	router.Run(":9999")
}
