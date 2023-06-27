function main() {
    fetch('/api')
        .then(response => response.json()) // Преобразуем ответ в объект JavaScript
        .then(data => {
            for (var i = 0; i < data.length; i++) {
                var ip = data[i].trim();
                console.log(ip, "\n");

                getBlockHeight(ip);
                getBlockCount(ip);
                getNodeState(ip);
                getVersion(ip);
            }
        })
        .catch(error => console.error(error));
}

function getBlockHeight(ip) {
    const url = `http://${ip}:30003`;
    const requestData = {
        jsonrpc: '2.0',
        method: 'getlatestblockheight',
        params: {},
        id: 1,
    };
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => console.log(JSON.stringify(data)))
        .catch(error => console.error(error));
}

function getBlockCount(ip) {
    const url = `http://${ip}:30003`;
    const requestData = {
        jsonrpc: "2.0",
        method: "getblockcount",
        params: {},
        id: 1
    };
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => console.log(JSON.stringify(data)))
        .catch(error => console.error(error));
}

function getNodeState(ip) {
    const url = `http://${ip}:30003`;
    const requestData = {
        jsonrpc: "2.0",
        method: "getnodestate",
        params: {},
        id: 1,
    };
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => console.log(JSON.stringify(data)))
        .catch(error => console.error(error));
}

function getVersion(ip) {
    const url = `http://${ip}:30003`;
    const requestData = {
        jsonrpc: "2.0",
        method: "getversion",
        params: {},
        id: 1,
    };
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => console.log(JSON.stringify(data)))
        .catch(error => console.error(error));
}

setInterval(main, 10000);