function sendIPs() {
    var ipList = document.getElementById("ipList").value;
    var ips = ipList.split(" ");

    if (ips.length > 0) {
        ips.unshift(ips[0]);
    }

    for (var i = 0; i < ips.length; i++) {
        var ip = ips[i];
        var data = {
            ip: ip
        };

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
    }

    document.getElementById("ipList").value = "";
}