let nodeList = [];
let today = new Date().toLocaleDateString("en-US");

async function main() {
    try {
        const response = await fetch('/api');
        const data = await response.json();
        const list = document.getElementById("list");

        if (list !== null) {
            const promises = data.map(async ({ ip }) => {
                const listItem = document.querySelector(`[data-ip="${ip}"]`);
                const isOnline = await checkConnection(ip);
                if (!isOnline) {
                    const offlineState = "OFFLINE";
                    if (listItem) {
                        updateCard(listItem, offlineState);
                    } else {
                        createCard(ip, "-", "-", "-", false, "-", offlineState);
                    }
                } else {
                    const [blockHeight, nodeState, time, version] = await Promise.all([
                        fetchData(ip, "getlatestblockheight"),
                        fetchData(ip, "getnodestate").then(result => result.proposalSubmitted),
                        fetchData(ip, "getnodestate").then(result => (parseFloat(result.uptime) / 3600.0).toFixed(1)),
                        fetchData(ip, "getversion")
                    ]);

                    let workTime = parseFloat(time).toFixed(1);
                    let flag = true;

                    if (time > 24) {
                        workTime = parseFloat(time / 24).toFixed(1);
                        flag = false;
                    }

                    if (listItem) {
                        updateCard(listItem, blockHeight, version, workTime, flag, nodeState);
                    } else {
                        createCard(ip, blockHeight, version, workTime, flag, "-", nodeState);
                    }
                }
            });

            await Promise.all(promises);
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

function createCard(ip, blockHeight, version, time, hours, minedToday, nodeState) {
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
    timeRow.textContent = time === "NaN" ? "-" : hours ? `${time} hours` : `${time} days`;
    card.appendChild(timeRow);

    const todayRow = document.createElement('div');
    todayRow.className = 'node-card-today';
    todayRow.textContent = minedToday;
    card.appendChild(todayRow);

    const allTimeRow = document.createElement('div');
    allTimeRow.className = 'node-card-all';
    allTimeRow.textContent = "-";
    card.appendChild(allTimeRow);

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

    if (typeof heightRow !== "undefined") {
        heightRow.textContent = blockHeight;
    } else {
        heightRow.textContent = "-";
    }

    if (typeof versionRow !== "undefined") {
        versionRow.textContent = version;
    } else {
        versionRow.textContent = "-";
    }

    if (typeof timeRow !== "undefined") {
        timeRow.textContent = time === "-" ? "-" : hours ? `${time} hours` : `${time} days`;
    } else {
        timeRow.textContent = "-";
    }

    if (typeof stateRow !== "undefined") {
        stateRow.textContent = nodeState;
    } else {
        stateRow.textContent = "OFFLINE";
    }
}

async function updateBlockNumbers() {
    const currentDate = new Date().toLocaleDateString("en-US");
    if (currentDate !== today) {
        resetList();
        today = currentDate;
    } else {
        const promises = nodeList.map(async ({ ip }) => {
            const listItem = document.querySelector(`[data-ip="${ip}"]`);
            if (listItem) {
                const isOnline = await checkConnection(ip);
                if (isOnline) {
                    try {
                        const blockNumberTodayRow = listItem.querySelector('.node-card-today');
                        if (blockNumberTodayRow) {
                            const blockNumberToday = await fetchData(ip, "getnodestate").then(result => result.proposalSubmitted);
                            blockNumberTodayRow.textContent = blockNumberToday;
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        });

        await Promise.all(promises);
    }
}

main();
setInterval(main, 10000);
setInterval(updateBlockNumbers, 60000);