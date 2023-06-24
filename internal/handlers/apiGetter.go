package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func nodeLastHeight(db *sql.DB, ip string) {
	url := fmt.Sprintf("http://%s:30003", ip)
	data := map[string]interface{}{}
	data["jsonrpc"] = "2.0"
	data["method"] = "getlatestblockheight"
	data["params"] = nil
	data["id"] = 1

	jsonValue, _ := json.Marshal(data)
	r, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
	if err != nil {
		panic(err)
	}
	s, _ := ioutil.ReadAll(r.Body)
	fmt.Println(string(s))
}

func nodeState(db *sql.DB, ip string) {
	url := fmt.Sprintf("http://%s:30003", ip)
	data := map[string]interface{}{}
	data["jsonrpc"] = "2.0"
	data["method"] = "getnodestate"
	data["params"] = nil
	data["id"] = 1

	jsonValue, _ := json.Marshal(data)
	r, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
	if err != nil {
		panic(err)
	}
	s, _ := ioutil.ReadAll(r.Body)
	fmt.Println(string(s))
}