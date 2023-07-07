package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/tidwall/gjson"
)

type nodeData struct {
	ip           string
	last_update  string
	blockNumber  string
	last_offline string
	last_state   string
}

func update(db *sql.DB) {
	updateData := `UPDATE nodes_ip SET height=?, version=?, work_time=?, mined_ever=?, mined_today=?, node_status=?, last_update=? WHERE ip=?;`
	for {
		nodes := []nodeData{}

		rows, err := db.Query("SELECT ip, last_update, last_block_number, last_offline_time, node_status FROM nodes_ip;")

		if err != nil {
			fmt.Println(err)
		}

		for rows.Next() {
			var node nodeData

			err = rows.Scan(&node.ip, &node.last_update, &node.blockNumber, &node.last_offline, &node.last_state)

			if err != nil {
				fmt.Println(err)
			}

			nodes = append(nodes, node)
		}

		actualTime := time.Now().Format("2006-01-02 15:04:05")

		for _, node := range nodes {
			fmt.Println(node.ip, checkConnection(node.ip))
			if checkConnection(node.ip) {
				height := int(gjson.Get(getData("getnodestate", node.ip), "result.height").Int())
				nodeState := gjson.Get(getData("getnodestate", node.ip), "result").String()
				version := gjson.Get(getData("getversion", node.ip), "result").String()

				totalBlocks := int(gjson.Get(getData("getnodestate", node.ip), "result.proposalSubmitted").Int())
				var blocksForToday int
				if node.blockNumber != "-" {
					lastBlockNumber, err := strconv.Atoi(node.blockNumber)
					if err != nil {
						panic(err)
					}
					blocksForToday = int(totalBlocks) - lastBlockNumber
				} else {
					blocksForToday = 0
				}

				state := gjson.Get(nodeState, "syncState").String()

				uptime := gjson.Get(nodeState, "uptime").Float()
				workTime := ""
				uptime /= 3600
				if uptime < 24 {
					workTime = fmt.Sprintf("%.1f h", uptime)
				} else {
					workTime = fmt.Sprintf("%.1f d", uptime/24)
				}

				if actualTime != node.last_update {
					db.Exec("UPDATE nodes_ip SET last_block_number=? WHERE ip=?;", totalBlocks, node.ip)
					db.Exec(updateData, height, version, workTime, totalBlocks, "0", state, actualTime, node.ip)
				} else {
					db.Exec(updateData, height, version, workTime, totalBlocks, blocksForToday, state, actualTime, node.ip)
				}
			} else {
				if node.last_state != "OFFLINE" {
					db.Exec("UPDATE nodes_ip SET last_offline_time=? WHERE ip=?;", time.Now().Format("2006-01-02 15:04:05"), node.ip)
					db.Exec(updateData, "-", "-", "-", "-", "-", "OFFLINE", time.Now().Format("2006-01-02 15:04:05"), "-", node.ip)
				} else {
					t, err := time.Parse("2006-01-02 15:04:05", node.last_offline)
					if err != nil {
						panic(err)
					}
					now, err := time.Parse("2006-01-02 15:04:05", time.Now().String())
					if err != nil {
						panic(err)
					}
					fmt.Println(t)
					fmt.Println(now)
					delta := now.Sub(t)
					fmt.Println(delta)
					if delta.Minutes() > 1 {
						remove := "DELETE FROM nodes_ip WHERE ip = ?"
						fmt.Println(node.ip)
						db.Exec(remove, node.ip)
					}
				}
			}
		}
		rows.Close()
	}
}

func checkConnection(ip string) bool {
	url := fmt.Sprintf("http://%s:30003", ip)

	_, err := http.Get(url)

	return err == nil
}

func getData(method, ip string) string {
	bytesRepresentation, err := json.Marshal(map[string]interface{}{
		"jsonrpc": "2.0",
		"method":  method,
		"params":  map[string]interface{}{},
		"id":      1,
	})

	if err != nil {
		panic(err)
	}

	url := fmt.Sprintf("http://%s:30003", ip)

	if checkConnection(ip) {
		resp, err := http.Post(url, "application/json", bytes.NewBuffer(bytesRepresentation))

		if err != nil {
			panic(err)
		}

		jsn, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			panic(err)
		}

		return string(jsn)
	}

	return `{"result": "-"}`
}
