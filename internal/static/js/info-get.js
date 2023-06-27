let blocksForToday = 0;

function main() {
    // const now = new Date();
    // const timezoneOffset = now.getTimezoneOffset();
    // const moscowTimezoneOffset = 180;
    // const differenceInMinutes = (moscowTimezoneOffset - timezoneOffset);
    // const differenceInMillis = differenceInMinutes * 60 * 1000;
    // const moscowNow = new Date(now.getTime() + differenceInMillis);

    // if (moscowNow.getHours() === 0 && moscowNow.getMinutes() === 0) {
    //     blocksForToday = 
    // }

    fetch('/api')
        .then(response => response.json())
        .then(data => {
            for (var i = 0; i < data.length; i++) {
                var ip = data[i].trim();
                
                fetch(`http://${ip}:30003/`, {
                    method: 'POST'
                })
                    .then(response => response.json())
                    .then(data => {
                        // node exists
                        var h = getBlockHeight(ip);
                        console.log(typeof h);
                        var cnt = getBlockCount(ip);
                        console.log(typeof cnt);
                        var st = getNodeState(ip);
                        console.log(typeof st);
                        var vers = getVersion(ip);
                        console.log(typeof vers);

                        const list = document.getElementById("list");
                        if (list != null) {
                            if (list.childNodes.length > 0) {
                                while (list.firstChild) {
                                    list.removeChild(list.firstChild);
                                }
                            }
                        }

                        createCard(ip, h, vers, cnt, cnt, st);
                    })
                    .catch(error => console.error(error));
            }
        })
        .catch(error => console.error(error));
}

function saveBlockCount(blocksCount) {
    blocksForToday = blocksCount;
    console.log(`Saved block count for the day: ${blocksForToday}`);
}

function getBlockHeight(ip) {
    const url = `http://${ip}:30003`;
    const requestData = {
        jsonrpc: '2.0',
        method: 'getlatestblockheight',
        params: {},
        id: 1,
    };
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => {
            // console.log(data.result);
            const res = String(data.result)
            return res;
        })
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
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => {
            // console.log(data.result);
            const res = String(data.result)
            return res;
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
            // console.log(data.result);
            // console.log(data.result.syncState);
            const res = String(data.result.syncState)
            return res;
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
            // console.log(data.result);
            const res = String(data.result)
            return res;
        })
        .catch(error => console.error(error));
}

function createCard(ip, blockHeight, version, minedToday, minedForAllTime, nodeState) {
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