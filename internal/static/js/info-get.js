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
            var ip = data[i].ip.trim();
            // TODO - make block number for today
            if (checkConnection(ip) === true) {
                const blockHeight = await getBlockHeight(ip);
                const blockNumberEver = await getBlockNumber(ip);
                const blockNumberToday = await getBlockNumber(ip);
                const nodeState = await getNodeState(ip);
                const version = await getVersion(ip);

                sendData(data[i].ip, blockNumberEver, blockNumberToday)

                createCard(ip, blockHeight, version, blockNumberEver, blockNumberToday, nodeState);
            } else {
                sendData(data[i].ip, 0, 0)

                createCard(ip, "-", "-", "-", "-", "Offline");
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function sendData(ip, ever, today) {
    let xhr = new XMLHttpRequest();
    let url = "/update";

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("it's ok");
        }
    };
    console.log(typeof ever);
    console.log(typeof today);
    var data = JSON.stringify({
        ip: ip,
        blocks_ever: ever,
        blocks_today: today,
    });
    xhr.send(data);
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
        .catch(error => console.error(error));
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