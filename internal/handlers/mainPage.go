package handlers

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
	"time"

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

		ip := strings.Split(strings.TrimSpace(gjson.Get(string(jsn), "ip").String()), " ")[0]
		nodeExists := gjson.Get(string(jsn), "exists").Bool()
		var generation int
		if strings.TrimSpace(gjson.Get(string(jsn), "generation").String()) != "" {
			if generation, err = strconv.Atoi(strings.TrimSpace(gjson.Get(string(jsn), "generation").String())); err != nil {
				panic(err)
			}
		} else {
			generation = getGenerationNumber(db)
		}

		actualTime := strings.Split(time.Now().String(), " ")[0]

		add := "INSERT INTO nodes_ip (ip, generation, height, version, work_time, mined_ever, mined_today, node_status, last_block_number, last_update, last_offline_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
		if nodeExists {

			var exists bool

			if err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM nodes_ip WHERE ip = ?)`, ip).Scan(&exists); err != nil {
				panic(err)
			}

			if exists {
				fmt.Println("there's such ip")
			} else {
				fmt.Println("there no node with such ip")
				if _, err = db.Exec(add, ip, generation, "-", "-", "-", "-", "-", "OFFLINE", "-", "-", strings.Split(strings.Join(strings.Split(time.Now().String(), " ")[:2], " "), ".")[0]); err != nil {
					panic(err)
				}
			}

			rows, err := db.Query("SELECT * FROM nodes_ip")
			if err != nil {
				panic(err)
			}

			cols, err := rows.Columns()
			if err != nil {
				panic(err)
			}

			all_ips := make([]interface{}, len(cols))
			for i := range cols {
				all_ips[i] = new(interface{})
			}

			for rows.Next() {
				if err = rows.Scan(all_ips...); err != nil {
					panic(err)
				}

				for i, column := range cols {
					val := *(all_ips[i].(*interface{}))
					fmt.Println(column, val)
				}
				fmt.Println()
			}

			rows.Close()
		} else {
			fmt.Println("there no node with such ip")
			if _, err = db.Exec(add, ip, generation, "-", "-", "-", "-", "-", "OFFLINE", "-", "-", actualTime); err != nil {
				panic(err)
			}
			go createNode(&ip, &generation)
			fmt.Println("continue working")
		}
		c.JSON(http.StatusOK, gin.H{})
	}
}

func getGenerationNumber(db *sql.DB) int {
	result := 1
	var NotGenerationFree bool
	for {
		if err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM nodes_ip WHERE generation = ?)`, result).Scan(&NotGenerationFree); err != nil {
			panic(err)
		}
		if NotGenerationFree {
			fmt.Println("this generation isn't avaliable")
			result++
		} else {
			return result
		}
	}
}

func createNode(ip *string, generation *int) {
	config := &ssh.ClientConfig{
		User: "root",
		Auth: []ssh.AuthMethod{
			ssh.Password("cyroHUg23Hgtn"),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	fmt.Printf("%s:22\n%d\n", *ip, *generation)
	fmt.Printf(`keys="http://5.180.183.19:9999/generations/%d.tar"`, *generation)
	fmt.Println()

	client, err := ssh.Dial("tcp", fmt.Sprintf("%s:22", *ip), config)
	if err != nil {
		panic(err)
	}

	session, err := client.NewSession()
	if err != nil {
		panic(err)
	}

	script := fmt.Sprintf(`
		#!/bin/bash
		apt update -y
		apt purge needrestart -y
		apt-mark hold linux-image-generic linux-headers-generic openssh-server snapd
		apt upgrade -y
		apt -y install unzip vnstat htop screen mc
		
		username="nkn"
		benaddress="NKNKKevYkkzvrBBsNnmeTVf2oaTW3nK6Hu4K"
		config="https://nknrus.ru/config.tar"
		keys="http://5.180.183.19:9999/generations/%d.tar"
		
		useradd -m -p "pass" -s /bin/bash "$username" > /dev/null 2>&1
		usermod -a -G sudo "$username" > /dev/null 2>&1
		
		printf "Downloading........................................... "
		cd /home/$username > /dev/null 2>&1
		wget --quiet --continue --show-progress https://commercial.nkn.org/downloads/nkn-commercial/linux-amd64.zip > /dev/null 2>&1
		printf "DONE!\n"
		
		printf "Installing............................................ "
		unzip linux-amd64.zip > /dev/null 2>&1
		mv linux-amd64 nkn-commercial > /dev/null 2>&1
		chown -c $username:$username nkn-commercial/ > /dev/null 2>&1
		/home/$username/nkn-commercial/nkn-commercial -b $benaddress -d /home/$username/nkn-commercial/ -u $username install > /dev/null 2>&1
		printf "DONE!\n"
		printf "sleep 180"
		
		sleep 180
		
		DIR="/home/$username/nkn-commercial/services/nkn-node/"
		
		systemctl stop nkn-commercial.service > /dev/null 2>&1
		sleep 20
		cd $DIR > /dev/null 2>&1
		rm wallet.json > /dev/null 2>&1
		rm wallet.pswd > /dev/null 2>&1
		rm config.json > /dev/null 2>&1
		rm -Rf ChainDB > /dev/null 2>&1
		wget -O - "$keys" -q --show-progress | tar -xf -
		wget -O - "$config" -q --show-progress | tar -xf -
		chown -R $username:$username wallet.* > /dev/null 2>&1
		chown -R $username:$username config.* > /dev/null 2>&1
		printf "Downloading.......................................... DONE!\n"
		systemctl start nkn-commercial.service > /dev/null 2>&1
		
		IP=$(hostname -I)
		curl -X POST -d "{\"ip\": \"$IP\", \"exists\": true, \"generation\": %d}" http://5.180.183.19:9999
	`, *generation, *generation)

	output, err := session.CombinedOutput(script)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(output))

	client.Close()
	session.Close()

	fmt.Println("ran script successfully")
}
