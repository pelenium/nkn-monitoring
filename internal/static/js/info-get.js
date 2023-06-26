fetch('/api')
    .then(response => response.json()) // Преобразуем ответ в объект JavaScript
    .then(data => {
        console.log(data);
    })
    .catch(error => console.error(error));