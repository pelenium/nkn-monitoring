package handlers

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/tidwall/gjson"
	"golang.org/x/crypto/ssh"
)

func AddGET(c *gin.Context) {
	c.HTML(http.StatusOK, "addIp.html", gin.H{})
}

func AddPOST(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		req := c.Request.Body
		jsn, err := ioutil.ReadAll(req)

		if err != nil {
			panic(err)
		}

		ip := strings.TrimSpace(gjson.Get(string(jsn), "ip").String())
		host, err := strconv.Atoi(strings.TrimSpace(gjson.Get(string(jsn), "host").String()))

		if err != nil {
			panic(err)
		}

		config := &ssh.ClientConfig{
			User: "root",
			Auth: []ssh.AuthMethod{
				ssh.Password("cyroHUg23Hgtn4"),
			},
			HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		}

		client, err := ssh.Dial("tcp", "5.180.181.133", config)
		if err != nil {
			log.Fatalf("Ошибка при подключении: %v", err)
		}
		defer client.Close()

		session, err := client.NewSession()
		if err != nil {
			log.Fatalf("Ошибка при создании сессии: %v", err)
		}
		defer session.Close()

		output, err := session.CombinedOutput(fmt.Sprintf(`curl -X POST -d "{\"ip\": \"%s\", \"host\": "%d"}" http://127.0.0.1:9999`, ip, host))
		if err != nil {
			log.Fatalf("Ошибка при выполнении команды: %v", err)
		}
		fmt.Println(string(output))
	}
}
