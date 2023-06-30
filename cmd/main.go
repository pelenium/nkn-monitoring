package main

import (
	"database/sql"
	"monitoring/internal/handlers"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	router := gin.Default()

	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

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
	
	router.POST("/delete", handlers.Delete(db))

	router.GET("/api", handlers.ApiGET(db))

	router.GET("/my-nodes", handlers.MyNodesGET)

	router.Run(":9999")
}
