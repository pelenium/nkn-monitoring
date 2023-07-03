// WORKING VERSION

let blockData = {};

async function main() {
    try {
        const response = await fetch('/api');
        const data = await response.json();
        const list = document.getElementById("list");

        for (const { ip } of data) {
            console.log(ip);

            const card = document.querySelector(`.node-card[data-ip="${ip}"]`);

            if (!card) {
                createCard(ip, "-", "-", "-", true, "-", "-", "OFFLINE");
            }

            const isConnected = await checkConnection(ip);

            if (isConnected) {
                const [blockHeight, blockNumberEver, nodeState, time, version] = await Promise.all([
                    getBlockHeight(ip),
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

                if (!blockData[ip]) {
                    blockData[ip] = {
                        blocksEver: blockNumberEver,
                        blocksToday: 0
                    };
                }

                if (blockData[ip].blocksEver !== blockNumberEver) {
                    blockData[ip].blocksToday = blockNumberEver - blockData[ip].blocksEver;
                    blockData[ip].blocksEver = blockNumberEver;
                }

                updateCard(card, blockHeight, version, workTime, flag, blockData[ip].blocksEver, blockData[ip].blocksToday, nodeState);
            } else {
                updateCard(card, "-", "-", "-", true, "-", "-", "-");
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function checkConnection(ip) {
    const url = `http://${ip}:30003`;
    try {
        const response = await fetch(url);
        return true;
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
    return fetchData(ip, "getnodestate").then(result => result.syncState);
}

async function getVersion(ip) {
    return fetchData(ip, "getversion");
}

function createCard(ip, blockHeight, version, time, hours, minedForAllTime, minedToday, nodeState) {
    const card = document.createElement('div');
    card.className = 'node-card';
    card.setAttribute('data-ip', ip);

    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';

    const ipRow = document.createElement('div');
    ipRow.className = 'node-card-ip';
    ipRow.textContent = ip;
    cardContainer.appendChild(ipRow);

    const heightRow = document.createElement('div');
    heightRow.className = 'node-card-height';
    heightRow.textContent = blockHeight;
    cardContainer.appendChild(heightRow);

    const versionRow = document.createElement('div');
    versionRow.className = 'node-card-version';
    versionRow.textContent = version;
    cardContainer.appendChild(versionRow);

    const timeRow = document.createElement('div');
    timeRow.className = 'node-card-time';
    timeRow.textContent = hours ? `${time} hours` : `${time} days`;
    cardContainer.appendChild(timeRow);

    const allTimeRow = document.createElement('div');
    allTimeRow.className = 'node-card-all';
    allTimeRow.textContent = minedForAllTime;
    cardContainer.appendChild(allTimeRow);

    const todayRow = document.createElement('div');
    todayRow.className = 'node-card-today';
    todayRow.textContent = minedToday;
    cardContainer.appendChild(todayRow);

    const stateRow = document.createElement('div');
    stateRow.className = 'node-card-state';
    stateRow.textContent = nodeState;
    cardContainer.appendChild(stateRow);

    card.appendChild(cardContainer);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.className = 'delete-button';

    deleteButton.addEventListener('click', function () {
        var ip = String(document.getElementById('ip').value);

        console.log(ip);

        var jsn = {
            ip: ip,
        };

        fetch("/delete", {
            method: "POST",
            body: JSON.stringify(jsn),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log("Ответ от сервера:", data);
            })
            .catch(error => {
                console.error("Ошибка при отправке данных:", error);
            });

        card.remove();
    });

    card.appendChild(deleteButton);

    const list = document.getElementById("list");
    if (list !== null) {
        list.appendChild(card);
    }
}

function updateCard(card, blockHeight, version, time, hours, minedForAllTime, minedToday, nodeState) {
    const heightRow = card.querySelector('.node-card-height');
    const versionRow = card.querySelector('.node-card-version');
    const timeRow = card.querySelector('.node-card-time');
    const allTimeRow = card.querySelector('.node-card-all');
    const todayRow = card.querySelector('.node-card-today');
    const stateRow = card.querySelector('.node-card-state');

    heightRow.textContent = blockHeight;
    versionRow.textContent = version;
    timeRow.textContent = hours ? `${time} hours` : `${time} days`;
    allTimeRow.textContent = minedForAllTime;
    todayRow.textContent = minedToday;
    stateRow.textContent = nodeState;

}

function resetTodayBlocks() {
    for (const ip in blockData) {
        blockData[ip].blocksToday = 0;
    }
}

main();
setInterval(main, 10000);

const now = new Date();
const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
const msUntilMidnight = midnight.getTime() - now.getTime();
setTimeout(resetTodayBlocks, msUntilMidnight);