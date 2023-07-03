function send() {
    var ip = String(document.getElementById('ip').value);
    var generation = String(document.getElementById('generation').value);

    generation = generation.length == 0 ? "0" : generation;

    console.log(ip);
    console.log(generation);

    var jsn = {
        ip: ip,
        generation: generation,
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
    document.getElementById('generation').value = "";
}