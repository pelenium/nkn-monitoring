package handlers

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/tidwall/gjson"
	"golang.org/x/crypto/ssh"
)

func PermissionDenied(c *gin.Context) {
	c.HTML(http.StatusOK, "permissionDenied.html", gin.H{})
}

func NodeIpPOST(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		req := c.Request.Body
		jsn, err := ioutil.ReadAll(req)

		if err != nil {
			panic(err)
		}

		ip := strings.TrimSpace(gjson.Get(string(jsn), "ip").String())
		nodeExists := gjson.Get(string(jsn), "exists").Bool()
		fmt.Println(ip)
		var generation int
		if strings.TrimSpace(gjson.Get(string(jsn), "generation").String()) != "" {
			generation, err = strconv.Atoi(strings.TrimSpace(gjson.Get(string(jsn), "generation").String()))
		} else {
			generation = 0
		}

		if err != nil {
			panic(err)
		}

		if generation == 0 {
			generation = getGenerationNumber(db)
		}

		fmt.Println(generation)

		if nodeExists {
			add := "INSERT INTO nodes_ip (ip, generation, height, version, work_time, mined_ever, mined_today, node_status, last_block_number, last_update) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

			var exists bool

			err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM nodes_ip WHERE ip = ?)`, ip).Scan(&exists)

			if err != nil {
				panic(err)
			}

			if exists {
				fmt.Println("there's such ip")
			} else {
				fmt.Println("there no node with such ip")
				_, err = db.Exec(add, ip, generation, "-", "-", "-", "-", "-", "OFFLINE", "-", "-")

				if err != nil {
					panic(err)
				}
			}

			rows, err := db.Query("SELECT * FROM nodes_ip")
			if err != nil {
				panic(err)
			}

			defer rows.Close()
			cols, err := rows.Columns()
			if err != nil {
				panic(err)
			}

			all_ips := make([]interface{}, len(cols))
			for i := range cols {
				all_ips[i] = new(interface{})
			}

			for rows.Next() {
				err = rows.Scan(all_ips...)
				if err != nil {
					panic(err)
				}

				for i, column := range cols {
					val := *(all_ips[i].(*interface{}))
					fmt.Println(column, val)
				}
				fmt.Println()
			}
		} else {
			go createNode(ip, generation)
		}
		c.JSON(http.StatusOK, gin.H{})
	}
}

func getGenerationNumber(db *sql.DB) int {
	result := 1
	var isGenerationFree bool
repeat:
	err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM nodes_ip WHERE generation = ?)`, result).Scan(&isGenerationFree)
	if err != nil {
		panic(err)
	}
	if isGenerationFree {
		fmt.Println("this generation isn't avaliable")
		result++
		goto repeat
	}
	return result
}

func createNode(ip string, generation int) {
	config := &ssh.ClientConfig{
		User: "root",
		Auth: []ssh.AuthMethod{
			ssh.Password("cyroHUg23Hgtn4"),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	fmt.Println(fmt.Sprintf("%s:22\n%d", ip, generation))
	fmt.Println(fmt.Sprintf(`keys="http://5.180.181.43:9999/generations/%d.tar"`, generation))

	client, err := ssh.Dial("tcp", fmt.Sprintf("%s:22", ip), config)
	if err != nil {
		fmt.Printf("Ошибка при подключении: %v", err)
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		fmt.Printf("Ошибка при создании сессии: %v", err)
	}
	defer session.Close()

	script := fmt.Sprintf(`
	#!/bin/bash
	sudo apt update -y
	sudo apt upgrade -y
	sudo apt purge needrestart -y
	sudo apt -y install unzip vnstat htop screen mc

	username="nkn"
	benaddress="NKNKKevYkkzvrBBsNnmeTVf2oaTW3nK6Hu4K"
	config="https://nknrus.ru/config.tar"
	keys="http://5.180.181.43:9999/generations/%d.tar"

	sudo useradd -m -p "pass" -s /bin/bash "$username" > /dev/null 2>&1
	sudo usermod -a -G sudo "$username" > /dev/null 2>&1

	printf "Downloading........................................... "
	cd /home/$username > /dev/null 2>&1
	sudo wget --quiet --continue --show-progress https://commercial.nkn.org/downloads/nkn-commercial/linux-amd64.zip > /dev/null 2>&1
	printf "DONE!\n"

	printf "Installing............................................ "
	sudo unzip linux-amd64.zip > /dev/null 2>&1
	sudo mv linux-amd64 nkn-commercial > /dev/null 2>&1
	sudo chown -c $username:$username nkn-commercial/ > /dev/null 2>&1
	sudo /home/$username/nkn-commercial/nkn-commercial -b $benaddress -d /home/$username/nkn-commercial/ -u $username install > /dev/null 2>&1
	printf "DONE!\n"
	printf "sleep 180\n"

	sleep 180

	DIR="/home/$username/nkn-commercial/services/nkn-node/"

	sudo systemctl stop nkn-commercial.service > /dev/null 2>&1
	sleep 20
	cd $DIR > /dev/null 2>&1
	sudo rm wallet.json > /dev/null 2>&1
	sudo rm wallet.pswd > /dev/null 2>&1
	sudo rm config.json > /dev/null 2>&1
	sudo rm -Rf ChainDB > /dev/null 2>&1
	sudo wget -O - "$keys" -q --show-progress | sudo tar -xf -
	sudo wget -O - "$config" -q --show-progress | sudo tar -xf -
	sudo chown -R $username:$username wallet.* > /dev/null 2>&1
	sudo chown -R $username:$username config.* > /dev/null 2>&1
	printf "Downloading.......................................... DONE!\n"
	sudo systemctl start nkn-commercial.service > /dev/null 2>&1

	IP=$(hostname -I)
	curl -X POST -d "{\"ip\": \"$IP\", \"exists\": true, \"generation\": %d}" http://127.0.0.1:9999
	`, generation, generation)

	output, err := session.CombinedOutput(script)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))
}
