document.getElementById("submit").addEventListener("click", async function () {
    await sendIP();
    console.log("Асинхронная функция выполнена");
});


async function sendIP() {
    var ip = String(document.getElementById("ip").value);
    var url = "/";
    var arr = ip.split(" ");

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    var i = 0;

    function sendNextIP() {
        if (i < arr.length) {
            var data = JSON.stringify({
                ip: arr[i],
            });
            xhr.send(data);
            i++;

            setTimeout(sendNextIP, 100);
        }
    }

    sendNextIP();

    document.getElementById("ip").value = "";
}