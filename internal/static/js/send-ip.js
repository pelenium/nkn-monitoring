function sendIP() {
    var ip = String(document.getElementById("ip").value);
    var xhr = new XMLHttpRequest();
    var url = "/";

    var arr = ip.split(" ");

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    for (var i = 0; i < arr.length; i++) {
        var data = JSON.stringify({
            ip: arr[i].trim(),
        });
        xhr.send(data);
    }

    document.getElementById("ip").value = ""
}