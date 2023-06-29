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
        for (var i = 0; i < data.length; i++) {
            var ip = data[i].ip;
            // TODO - make block number for today
            // if (checkConnection(ip) !== true) {
            const blockHeight = await getBlockHeight(ip);
            const blockNumberEver = await getBlockNumber(ip);
            const blockNumberToday = await getBlockNumber(ip);
            const nodeState = await getNodeState(ip);
            const time = await getTime(ip);
            const version = await getVersion(ip);
            var workTime = parseFloat(time).toFixed(1)
            var flag = true
            if (time > 24) {
                workTime = (time / 24).toFixed(1);
                flag = false
            }
            createCard(ip, blockHeight, version, workTime, flag, blockNumberEver, blockNumberToday, nodeState);

            // } else {
            //     createCard(ip, "-", "-", "-", false, "-", "-", "OFFLINE");
            // }
        }
    } catch (error) {
        console.error(error);
    }
}

async function checkConnection(ip) {
    const url = `http://${ip}:30003`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
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
        .catch(error => {
            return "-"
        });
}

function getBlockNumber(ip) {
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
            return data.result.proposalSubmitted;
        })
        .catch(error => {
            return "-"
        });
}

function getTime(ip) {
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
            return (parseFloat(data.result.uptime) / 3600.0).toFixed(1);
        })
        .catch(error => {
            return "-"
        });
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
        .catch(error => {
            return "OFFLINE"
        });
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
        .catch(error => {
            return "-"
        });
}

function createCard(ip, blockHeight, version, time, hours, minedForAllTime, minedToday, nodeState) {
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

    const timeRow = document.createElement('div');
    timeRow.className = 'node-card-time';
    if (hours == true) {
        timeRow.textContent = `${time} hours`;
    } else {
        timeRow.textContent = `${time} days`;
    }
    card.appendChild(timeRow);

    const allTimeRow = document.createElement('div');
    allTimeRow.className = 'node-card-all';
    allTimeRow.textContent = minedForAllTime;
    card.appendChild(allTimeRow);

    const todayRow = document.createElement('div');
    todayRow.className = 'node-card-today';
    todayRow.textContent = minedToday;
    card.appendChild(todayRow);

    const stateRow = document.createElement('div');
    stateRow.className = 'node-card-state';
    stateRow.textContent = nodeState;
    card.appendChild(stateRow);

    const list = document.getElementById("list");
    list.appendChild(card);
}
main();
setInterval(main, 10000);