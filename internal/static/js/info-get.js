// WORKING VERSION

async function main() {
    fetch('/api')
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonArray) {
            jsonArray.forEach(function (i) {
                console.log("ip:", i.ip);
                console.log("generation:", i.generation);
                console.log("height:", i.height);
                console.log("version:", i.version);
                console.log("work_time:", i.work_time);
                console.log("mined_ever:", i.mined_ever);
                console.log("mined_today:", i.mined_today);
                console.log("node_status:", i.node_status);
            });
        })
        .catch(function (error) {
            console.log('Ошибка:', error);
        });
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

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.className = 'delete-button';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.appendChild(deleteButton);

    card.appendChild(buttonContainer);

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

function updateCard(card, blockHeight, version, time, minedForAllTime, minedToday, nodeState) {
    card.querySelector('.node-card-height').textContent = blockHeight;
    card.querySelector('.node-card-version').textContent = version;
    card.querySelector('.node-card-time').textContent = time;
    card.querySelector('.node-card-all').textContent = minedForAllTime;
    card.querySelector('.node-card-today').textContent = minedToday;
    card.querySelector('.node-card-state').textContent = nodeState;
}

main();
setInterval(main, 10000);