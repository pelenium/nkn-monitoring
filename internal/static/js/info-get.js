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
            var ip = data[i].trim();

            console.log(ip);

            const blockHeight = await getBlockHeight(ip);
            const blockCount = data[i].blocks_ever;
            console.log(`height - ${blockHeight}\ncount - ${blockCount}`);
            const nodeState = data[i].blocks_ever;
            const version = await getVersion(ip);

            createCard(ip, blockHeight, version, blockCount, blockCount, nodeState);
        }
    } catch (error) {
        console.error(error);
    }
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
            return data.result;
        })
        .catch(error => console.error(error));
}

async function getBlockCount(ip) {
    const url = `http://${ip}:30003`;
    const requestData = {
      jsonrpc: '2.0',
      method: 'getblockcount',
      params: {},
      id: 1,
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const data = await response.json();
  
      if (response.ok) {
        return data.result; // Возвращаем общее количество блоков
      } else {
        throw new Error(data.error.message);
      }
    } catch (error) {
      console.error('Произошла ошибка:', error.message);
      // Обработка ошибки - можно вернуть значение по умолчанию или выбрать другой способ обработки.
      return null;
    }
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

function createCard(ip, blockHeight, version, minedToday, minedForAllTime, nodeState) {
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