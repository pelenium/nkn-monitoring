package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/tidwall/gjson"
)

func update(db *sql.DB) {
	updateData := `UPDATE nodes_ip SET height=?, version=?, work_time=?, mined_ever=?, mined_today=?, node_status=?, last_update=? WHERE ip=?;`
repeat:
	ips := []string{}
	lastUpdates := []string{}
	blocks := []string{}

	rows, err := db.Query("SELECT ip, last_update, last_block_number FROM nodes_ip;")

	if err != nil {
		fmt.Println(err)
	}

	defer rows.Close()

	for rows.Next() {
		var ip string
		var last_update string
		var blockNumber string

		err = rows.Scan(&ip, &last_update, &blockNumber)

		if err != nil {
			fmt.Println(err)
		}

		ips = append(ips, ip)
		lastUpdates = append(lastUpdates, last_update)
		blocks = append(blocks, blockNumber)
	}

	for indx, ip := range ips {
		if checkConnection(ip) {
			height := int(gjson.Get(getData("getnodestate", ip), "result.height").Int())
			nodeState := gjson.Get(getData("getnodestate", ip), "result").String()
			version := gjson.Get(getData("getversion", ip), "result").String()

			totalBlocks := int(gjson.Get(getData("getnodestate", ip), "result.proposalSubmitted").Int())
			var blocksForToday int
			if blocks[indx] != "-" {
				lastBlockNumber, err := strconv.Atoi(blocks[indx])
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

			actualTime := strings.Split(time.Now().String(), " ")[0]

			if actualTime != lastUpdates[indx] {
				db.Exec("UPDATE nodes_ip SET last_block_number=? WHERE ip=?;", totalBlocks, ip)
				db.Exec(updateData, height, version, workTime, totalBlocks, "0", state, actualTime, ip)
			} else {
				db.Exec(updateData, height, version, workTime, totalBlocks, blocksForToday, state, actualTime, ip)
			}
		} else {
			db.Exec(updateData, "-", "-", "-", "-", "-", "OFFLINE", strings.Split(time.Now().String(), " ")[0], "-", ip)
		}
	}
	goto repeat
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
