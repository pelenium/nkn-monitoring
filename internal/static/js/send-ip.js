function send() {
    var ip = String(document.getElementById('ip').value);
    var host = String(document.getElementById('host').value);

    host = host.length == 0 ? "0" : host;

    console.log(ip);
    console.log(host);

    var jsn = {
        ip: ip,
        host: host,
    };

    fetch("/", {
        method: "POST",
        body: JSON.stringify(jsn),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("Ответ от сервера:", data);
        })
        .catch(error => {
            console.error("Ошибка при отправке данных:", error);
        });

    document.getElementById('ip').value = "";
    document.getElementById('host').value = "";
}