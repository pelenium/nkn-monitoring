var blockData = {};
async function main() {
    try {
        const response = await fetch('/api');
        const data = await response.json();

        const list = document.getElementById("list");
        if (list != null) {
            if (list.childNodes.length > 0) {
                while (list.firstChild) {
                    list.removeChild(list.firstChild);
                }
            }
        }
        blockData.length = data.length;
        for (var i = 0; i < data.length; i++) {
            var ip = data[i].ip.trim();
            // TODO - make block number for today
            const blockHeight = await getBlockHeight(ip);
            var blockNumberEver, blockNumberToday
            const nodeState = await getNodeState(ip);
            const version = await getVersion(ip);
            const blockHash = await getBlockHash(ip);

            if (data[i].ip in blockData) {
                var arr = blockData[data[i].ip];
                arr.push(blockHash);
                arr = [...new Set(arr)];
                blockData[data[i].ip] = arr;
            } else {
                blockData[data[i].ip] = [blockHash];
            }

            if (data[i].ip in blockData) {
                blockNumberEver = blockData[data[i].ip].length;
                blockNumberToday = blockData[data[i].ip].length;
            } else {
                blockNumberEver = 0;
                blockNumberToday = 0;
            }

            sendData(blockData, data[i].ip, blockNumberEver, blockNumberToday)

            createCard(ip, blockHeight, version, blockNumberEver, blockNumberToday, nodeState);
        }
        console.log(JSON.stringify(blockData));
    } catch (error) {
        console.error(error);
    }
}

function sendData(jsn, ip, ever, today) {
    let xhr = new XMLHttpRequest();
    let url = "/update";

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("it's ok");
        }
    };
    
    var data = JSON.stringify({
        ip: ip,
        blocks_ever: ever,
        blocks_today: today,
    });
    xhr.send(JSON.stringify(data));
}

function getBlockHeight(ip) {
    const url = `http://${ip}:30003`;
    const requestData = {
        jsonrpc: "2.0",
        method: "getlatestblockheight",
        params: {},
        id: 1,
    };
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => {
            return data.result;
        })
        .catch(error => console.error(error));
}

function getBlockHash(ip) {
    const url = `http://${ip}:30003`;
    const requestData = {
        jsonrpc: "2.0",
        method: "getlatestblockhash",
        params: {},
        id: 1,
    };
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => {
            return data.result.hash;
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
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => {
            return data.result.syncState;
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
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => {
            return data.result;
        })
        .catch(error => console.error(error));
}

function createCard(ip, blockHeight, version, minedForAllTime, minedToday, nodeState) {
    const card = document.createElement('div');
    card.className = 'node-card';

    const ipRow = document.createElement('div');
    ipRow.className = 'node-card-ip';
    ipRow.textContent = ip;
    card.appendChild(ipRow);

    const heightRow = document.createElement('div');
    heightRow.className = 'node-card-height';
    heightRow.textContent = blockHeight;
    card.appendChild(heightRow);

    const versionRow = document.createElement('div');
    versionRow.className = 'node-card-version';
    versionRow.textContent = version;
    card.appendChild(versionRow);

    const todayRow = document.createElement('div');
    todayRow.className = 'node-card-today';
    todayRow.textContent = minedToday;
    card.appendChild(todayRow);

    const allTimeRow = document.createElement('div');
    allTimeRow.className = 'node-card-all';
    allTimeRow.textContent = minedForAllTime;
    card.appendChild(allTimeRow);

    const stateRow = document.createElement('div');
    stateRow.className = 'node-card-state';
    stateRow.textContent = nodeState;
    card.appendChild(stateRow);

    const list = document.getElementById("list");
    list.appendChild(card);
}

main();
setInterval(main, 10000);