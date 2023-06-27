let blocksfortoday = 0;

function main() {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset();
    const moscowTimezoneOffset = 180;
    const differenceInMinutes = (moscowTimezoneOffset - timezoneOffset);
    const differenceInMillis = differenceInMinutes * 60 * 1000;
    const moscowNow = new Date(now.getTime() + differenceInMillis);

    if (moscowNow.getHours() === 0 && moscowNow.getMinutes() === 0) {
        saveBlockCount(blocksfortoday);
    }

    fetch('/api')
        .then(response => response.json())
        .then(data => {
            for (var i = 0; i < data.length; i++) {
                var ip = data[i].trim();

                getBlockHeight(ip);
                getBlockCount(ip, moscowNow);
                getNodeState(ip);
                getVersion(ip);
            }
        })
        .catch(error => console.error(error));
}

function saveBlockCount(blocksCount) {
    blocksfortoday = blocksCount;
    console.log(`Saved block count for the day: ${blocksfortoday}`);
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
        .then(data => {
            console.log(data.result);
        })
        .catch(error => console.error(error));
}

function getBlockCount(ip, moscowNow) {
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
        .then(data => {
            console.log(JSON.stringify(data));
            if (moscowNow.getHours() === 0 && moscowNow.getMinutes() === 0) {
                saveBlockCount(data.result);
            }
        })
        .catch(error => console.error(error));
}

function getBlockCountToday(ip) {
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
        .then(data => {
            console.log(data.result);
            if (moscowNow.getHours() === 0 && moscowNow.getMinutes() === 0) {
                saveBlockCount(data.result - blocksfortoday);
            }
        })
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
        .then(data => {
            console.log(data.result);
        })
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
        .then(data => {
            console.log(data.result);
        })
        .catch(error => console.error(error));
}

setInterval(main, 10000); 
