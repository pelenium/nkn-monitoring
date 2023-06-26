fetch('/api')
    .then(response => response.json()) // Преобразуем ответ в объект JavaScript
    .then(data => {
        for (let i in data) {
            console.log(i);
        }
    })
    .catch(error => console.error(error));