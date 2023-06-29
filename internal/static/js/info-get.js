async function main() {
    try {
        const response = await fetch('/api');
        const data = await response.json();
        const list = document.getElementById("list");

        if (list && list.childNodes.length > 0) {
            while (list.firstChild) {
                list.removeChild(list.firstChild);
            }
        }

        for (const { ip } of data) {
            console.log(ip);

            if (hasLetters(ip)) {
                continue;
            }

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
                workTime = (time / 24).toFixed(1);
                flag = false;
            }

            createCard(ip, blockHeight, version, workTime, flag, blockNumberEver, blockNumberToday, nodeState);
        }
    } catch (error) {
        console.error(error);
    }
}

function hasLetters(string) {
    const regex = /[а-яА-Яa-zA-Z]/;
    return regex.test(string);
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

async function fetchData(ip, method, requestData) {
    const url = `http://${ip}:30003`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            return data.result;
        } else {
            return "-";
        }
    } catch (error) {
        return "-";
    }
}

async function getBlockHeight(ip) {
    const requestData = {
        jsonrpc: "2.0",
        method: "getlatestblockheight",
        params: {},
        id: 1,
    };

    return fetchData(ip, 'POST', requestData);
}

async function getBlockNumber(ip) {
    const requestData = {
        jsonrpc: "2.0",
        method: "getnodestate",
        params: {},
        id: 1,
    };

    const data = await fetchData(ip, 'POST', requestData);
    return data.proposalSubmitted || "-";
}

async function getTime(ip) {
    const requestData = {
        jsonrpc: "2.0",
        method: "getnodestate",
        params: {},
        id: 1,
    };

    const data = await fetchData(ip, 'POST', requestData);
    return (parseFloat(data.uptime) / 3600.0).toFixed(1) || "-";
}

async function getNodeState(ip) {
    const requestData = {
        jsonrpc: "2.0",
        method: "getnodestate",
        params: {},
        id: 1,
    };

    const data = await fetchData(ip, 'POST', requestData);
    return data.syncState || "OFFLINE";
}

async function getVersion(ip) {
    const requestData = {
        jsonrpc: "2.0",
        method: "getversion",
        params: {},
        id: 1,
    };

    const data = await fetchData(ip, 'POST', requestData);
    return data || "-";
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
setInterval(main, 15000);