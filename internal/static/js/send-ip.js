function sendIP() {
    var ipInput = document.getElementById("ip").value;

    var ipArray = ipInput.split(" ");

    var jsonData = {
        ip: ipArray
    };

    fetch("/", {
        method: "POST",
        body: JSON.stringify(jsonData),
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
}  