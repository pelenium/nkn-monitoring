let nodeList = [];
let today = new Date().toLocaleDateString("en-US");

async function main() {
    try {
        const response = await fetch('/api');
        const data = await response.json();
        const list = document.getElementById("list");

        if (list !== null) {
            for (const { ip } of data) {
                const listItem = document.querySelector(`[data-ip="${ip}"]`);
                if (listItem) {
                    const [blockHeight, , , nodeState, time, version] = await Promise.all([
                        getBlockHeight(ip),
                        getBlockNumber(ip),
                        getBlockNumber(ip),
                        getNodeState(ip),
                        getTime(ip),
                        getVersion(ip)
                    ]);

                    let workTime = parseFloat(time).toFixed(1);
                    let flag = true;

                    if (time > 24) {
                        workTime = parseFloat(time / 24).toFixed(1);
                        flag = false;
                    }

                    updateCard(listItem, blockHeight, version, workTime, flag, nodeState);
                } else {
                    const [blockHeight, blockNumberEver, blockNumberToday, nodeState, time, version] = await Promise.all([
                        getBlockHeight(ip),
                        getBlockNumber(ip),
                        getBlockNumber(ip),
                        getNodeState(ip),
                        getTime(ip),
                        getVersion(ip)
                    ]);

                    let workTime = parseFloat(time).toFixed(1);
                    let flag = true;

                    if (time > 24) {
                        workTime = parseFloat(time / 24).toFixed(1);
                        flag = false;
                    }
                    console.log(nodeState);
                    createCard(ip, blockHeight, version, workTime, flag, blockNumberEver, blockNumberToday, nodeState);
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function resetList() {
    const list = document.getElementById("list");
    if (list !== null) {
        nodeList = [];
        list.innerHTML = '';
    }
}

async function checkConnection(ip) {
    const url = `http://${ip}:30003`;

    try {
        const response = await fetch(url);
        return response.ok;
    } catch (error) {
        return false;
    }
}

async function fetchData(ip, requestDataKey) {
    const url = `http://${ip}:30003`;
    const requestData = {
        jsonrpc: "2.0",
        method: requestDataKey,
        params: {},
        id: 1
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        return data.result;
    } catch (error) {
        return "-";
    }
}

async function getBlockHeight(ip) {
    return fetchData(ip, "getlatestblockheight");
}

async function getBlockNumber(ip) {
    return fetchData(ip, "getnodestate").then(result => result.proposalSubmitted);
}

async function getTime(ip) {
    return fetchData(ip, "getnodestate")
        .then(result => (parseFloat(result.uptime) / 3600.0).toFixed(1));
}

async function getNodeState(ip) {
    return fetchData(ip, "getnodestate").then(result => result.sync_state);
}

async function getVersion(ip) {
    return fetchData(ip, "getversion");
}

function createCard(ip, blockHeight, version, time, hours, minedForAllTime, minedToday, nodeState) {
    const card = document.createElement('div');
    card.className = 'node-card';
    card.setAttribute('data-ip', ip);

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
    timeRow.textContent = hours ? `${time} hours` : `${time} days`;
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
    if (list !== null) {
        list.appendChild(card);
    }

    const nodeInfo = {
        ip: ip,
        blockNumberToday: minedToday
    };
    nodeList.push(nodeInfo);
}

function updateCard(card, blockHeight, version, time, hours, nodeState) {
    const heightRow = card.querySelector('.node-card-height');
    const versionRow = card.querySelector('.node-card-version');
    const timeRow = card.querySelector('.node-card-time');
    const stateRow = card.querySelector('.node-card-state');

    if (heightRow) {
        heightRow.textContent = blockHeight;
    }

    if (versionRow) {
        versionRow.textContent = version;
    }

    if (timeRow) {
        timeRow.textContent = time == "-" ? `-` : hours ? `${time} hours` : `${time} days`;
    }

    if (stateRow) {
        stateRow.textContent = nodeState;
    }
}

function updateBlockNumbers() {
    const currentDate = new Date().toLocaleDateString("en-US");
    if (currentDate !== today) {
        resetList();
        today = currentDate;
    } else {
        for (const { ip } of nodeList) {
            const listItem = document.querySelector(`[data-ip="${ip}"]`);
            if (listItem) {
                const blockNumberTodayRow = listItem.querySelector('.node-card-today');
                if (blockNumberTodayRow) {
                    getBlockNumber(ip)
                        .then(blockNumberToday => {
                            blockNumberTodayRow.textContent = blockNumberToday;
                        })
                        .catch(error => {
                            console.error(error);
                            blockNumberTodayRow.textContent = "-";
                        });
                }
            }
        }
    }
}

main();
setInterval(main, 10000);
setInterval(updateBlockNumbers, 60000);