function sendIP() {
    var ip = String(document.getElementById("ip").value);
    var url = "/";
    console.log(ip);
    var arr = ip.split(" ");
    console.log(arr);
    var xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    for (var i = 0; i < arr.length; i++) {
        var data = JSON.stringify({
            ip: arr[i],
        });
        xhr.send(data);
    }

    document.getElementById("ip").value = "";
}