async function sendIP() {
    var ip = String(document.getElementById("ip").value);
    var url = "/";
    var arr = ip.split(" ");

    for (var i = 0; i < arr.length; i++) {
        console.log(arr[i].trim());
        var data = JSON.stringify({
            ip: arr[i].trim(),
        });

        try {
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: data,
            });
        } catch (error) {
            console.error(error);
        }
    }
    
    document.getElementById("ip").value = "";
}