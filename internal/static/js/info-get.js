let blocksfortoday = 0;

function main() {
    const list = document.getElementById('list-id');
    if (list.childNodes.length > 0) {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
    }

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
            console.log(data.result);
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

function addNodeToList(ip, blockHeight, version, minedToday, minedForAllTime, nodeState) {
    const card = document.createElement('div');
    card.className = 'node-card';

    const ipRow = document.createElement('div');
    ipRow.className = 'node-card-row';
    ipRow.textContent = ip;
    card.appendChild(ipRow);

    const heightRow = document.createElement('div');
    heightRow.className = 'node-card-row';
    heightRow.textContent = blockHeight;
    card.appendChild(heightRow);

    const versionRow = document.createElement('div');
    versionRow.className = 'node-card-row';
    versionRow.textContent = version;
    card.appendChild(versionRow);

    const todayRow = document.createElement('div');
    todayRow.className = 'node-card-row';
    todayRow.textContent = minedToday;
    card.appendChild(todayRow);

    const allTimeRow = document.createElement('div');
    allTimeRow.className = 'node-card-row';
    allTimeRow.textContent = minedForAllTime;
    card.appendChild(allTimeRow);

    const stateRow = document.createElement('div');
    stateRow.className = 'node-card-row';
    stateRow.textContent = nodeState;
    card.appendChild(stateRow);

    const list = document.getElementById("list");
    list.appendChild(card);
}

main();

setInterval(main, 10000);