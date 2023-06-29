function sendIP() {
    var ip = String(document.getElementById("ip").value);
    var url = "/";
    console.log(ip);
    var arr = ip.split(" ");
    arr.unshift("aaa");
    console.log(arr);

    for (var i = 0; i < arr.length; i++) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        var data = JSON.stringify({
            ip: arr[i],
        });
        console.log(data);
        xhr.send(data);
    }
}  