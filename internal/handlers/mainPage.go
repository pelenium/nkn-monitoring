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

		ip := strings.Split(strings.TrimSpace(gjson.Get(string(jsn), "ip").String()), " ")[0]
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
			fmt.Println("continue working")
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

	fmt.Printf("%s:22\n%d\n", ip, generation)
	fmt.Printf(`keys="http://5.180.181.43:9999/generations/%d.tar"`, generation)
	fmt.Println()

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

	output, err := session.CombinedOutput("apt update -y")
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput("apt purge needrestart -y")
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput("apt-mark hold linux-image-generic linux-headers-generic openssh-server snapd")
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput("apt upgrade -y")
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput("apt -y install unzip vnstat htop screen mc")
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`username="nkn"`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`benaddress="NKNKKevYkkzvrBBsNnmeTVf2oaTW3nK6Hu4K"`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`config="https://nknrus.ru/config.tar"`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(fmt.Sprintf(`keys="http://103.45.247.41:9999/generations/%d.tar"`, generation))
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`useradd -m -p "pass" -s /bin/bash "$username" > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`usermod -a -G sudo "$username" > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`printf "Downloading........................................... "`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`cd /home/$username > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`wget --quiet --continue --show-progress https://commercial.nkn.org/downloads/nkn-commercial/linux-amd64.zip > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`printf "DONE!\n"`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`printf "Installing............................................ "`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`unzip linux-amd64.zip > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`mv linux-amd64 nkn-commercial > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`chown -c $username:$username nkn-commercial/ > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`/home/$username/nkn-commercial/nkn-commercial -b $benaddress -d /home/$username/nkn-commercial/ -u $username install > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`printf "DONE!\n"`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`printf "sleep 180"`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`sleep 180`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`DIR="/home/$username/nkn-commercial/services/nkn-node/"`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`systemctl stop nkn-commercial.service > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`sleep 20`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`cd $DIR > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`rm wallet.json > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`rm wallet.pswd > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`rm config.json > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`rm -Rf ChainDB > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`wget -O - "$keys" -q --show-progress | tar -xf -`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`wget -O - "$config" -q --show-progress | tar -xf -`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`chown -R $username:$username wallet.* > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`chown -R $username:$username config.* > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`printf "Downloading.......................................... DONE!\n"1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(`systemctl start nkn-commercial.service > /dev/null 2>&1`)
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	output, err = session.CombinedOutput(fmt.Sprintf(`curl -X POST -d "{\"ip\": \"%s\", \"exists\": true, \"generation\": %d}" http://103.45.247.41:9999`, ip, generation))
	if err != nil {
		fmt.Printf("Ошибка при выполнении команды: %v", err)
	}
	fmt.Println(string(output))

	fmt.Println("ran script")
}
