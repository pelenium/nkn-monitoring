package main

import (
	"database/sql"
	"monitoring/internal/handlers"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	router := gin.Default()

	db, err := sql.Open("sqlite3", "./../db/nodes.sqlite")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	create := "CREATE TABLE nodes-ip (ip TEXT PRIMARY KEY)"
	_, err = db.Exec(create)

	if err != nil {
		panic(err)
	}

	router.LoadHTMLGlob("./../internal/html/*.html")

	router.GET("/", handlers.MainPageGET)

	router.POST("/", handlers.MainPagePOST(db))

	router.Run(":9999")
}
