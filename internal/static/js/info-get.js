var blocksToday = 0;

var number = 0;
var offlineNumber = 0;

async function main() {
    blocksToday = 0;
    number = 0;
    offlineNumber = 0;
    fetch('/api')
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonArray) {
            jsonArray.forEach(function (i) {
                const ip = i.ip;
                const generation = i.generation;
                const height = i.height;
                const version = i.version;
                const workTime = i.work_time;
                const minedEver = i.mined_ever;
                const minedToday = i.mined_today;
                const nodeStatus = i.node_status;

                blocksToday += minedToday;

                const existingCard = document.querySelector(`.node-card[data-ip="${ip}"]`);
                if (existingCard) {
                    updateCard(existingCard, height, version, generation, workTime, minedEver, nodeStatus);
                } else {
                    createCard(ip, height, version, generation, workTime, minedEver, nodeStatus);
                }

                number++;
                offlineNumber = nodeStatus == "OFFLINE" ? offlineNumber + 1 : offlineNumber;
            });
        })
        .catch(function (error) {
            console.log('Ошибка:', error);
        });
    getWalletBalance("NKNEfKFwLjdN2SXJU2UZaY3aECVuC6kTjwzz");
    var mt = document.getElementById("mined-today");
    mt.textContent = blocksToday;

    var t = document.getElementById("title");
    t.textContent = `My working nodes ${number - offlineNumber}/${number}`;
}

function getWalletBalance(wallet) {
    var url = `https://openapi.nkn.org/api/v1/addresses/${wallet}`
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data.balance);
            var mt = document.getElementById("balance");
            mt.textContent = parseFloat(data.balance) / parseFloat(100000000);
        })
        .catch(error => {
            console.log('Произошла ошибка', error);
        });
}

function createCard(ip, blockHeight, version, generation, time, minedForAllTime, nodeState) {
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

    const generationRow = document.createElement('div');
    generationRow.className = 'node-card-generation';
    generationRow.textContent = generation;
    card.appendChild(generationRow);

    const timeRow = document.createElement('div');
    timeRow.className = 'node-card-time';
    timeRow.textContent = time;
    card.appendChild(timeRow);

    const allTimeRow = document.createElement('div');
    allTimeRow.className = 'node-card-all';
    allTimeRow.textContent = minedForAllTime;
    card.appendChild(allTimeRow);

    const stateRow = document.createElement('div');
    stateRow.className = 'node-card-state';
    stateRow.textContent = nodeState;
    card.appendChild(stateRow);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.appendChild(deleteButton);

    card.appendChild(buttonContainer);

    deleteButton.addEventListener('click', function () {
        var ip = String(card.getAttribute('data-ip'));

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

function updateCard(card, blockHeight, version, generation, time, minedForAllTime, nodeState) {
    card.querySelector('.node-card-height').textContent = blockHeight;
    card.querySelector('.node-card-version').textContent = version;
    card.querySelector('.node-card-generation').textContent = generation;
    card.querySelector('.node-card-time').textContent = time;
    card.querySelector('.node-card-all').textContent = minedForAllTime;
    card.querySelector('.node-card-state').textContent = nodeState;
}

main();
setInterval(main, 10000);