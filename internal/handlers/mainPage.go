package handlers

import (
	"database/sql"
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
	"github.com/tidwall/gjson"
)

func MainPageGET(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", gin.H{})
}

func MainPagePOST(c *gin.Context) {
	req := c.Request.Body
	jsn, err := ioutil.ReadAll(req)

	if err != nil {
		panic(err)
	}

	ip := gjson.Get(string(jsn), "ip").String()

	if ip != "" {
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

		add := "INSERT INTO nodes-ip (ip) values ?"
		remove := "DELETE FROM nodes-ip WHERE ip=?"

		requestType := gjson.Get(string(jsn), "type").String()

		if requestType == "add" {
			_, err = db.Exec(add, ip)
			if err != nil {
				panic(err)
			}
		} else {
			_, err = db.Exec(remove, ip)
			if err != nil {
				panic(err)
			}
		}
	}
}
