function sendIP() {
    return new Promise(function(resolve, reject) {
        var ip = String(document.getElementById("ip").value);
        var xhr = new XMLHttpRequest();
        var url = "/";

        var arr = ip.split(" ");

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = function() {
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            } else {
                reject(Error(xhr.statusText));
            }
        };

        xhr.onerror = function() {
            reject(Error("Network Error"));
        };

        for (var i = 0; i < arr.length; i++) {
            console.log(arr[i].trim());
            var data = JSON.stringify({
                ip: arr[i].trim(),
            });
            xhr.send(data);
        }

        document.getElementById("ip").value = "";
    });
}

document.getElementById("submit").addEventListener("click", async function() {
    try {
        await sendIP();
    } catch (error) {
        console.error(error);
    }
});