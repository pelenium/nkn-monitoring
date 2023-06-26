fetch('/api')
    .then(response => response.json()) // Преобразуем ответ в объект JavaScript
    .then(data => {
        for (var i = 0; i < data.length; i++) {
            let ip = data[i];
            
            console.log(ip);
            // const apiUrl = `http://${ip}:30003/`;
            // const requestData = { jsonrpc: '2.0', method: 'getlatestblockheight', params: {}, 'id': 1 };

            // fetch(apiUrl, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(requestData)
            // })
            //     .then(response => response.json())
            //     .then(info => {
            //         let jsn = JSON.parse(info);
            //         console.log(jsn);
            //     })
            //     .catch(error => { console.error('Ошибка при загрузке данных:', error); });
        }
    })
    .catch(error => console.error(error));