const blockIPAdress = { // Блок с запросом айпи адресса
    block : document.querySelector('.ipAdress'),
    input : document.querySelector('.ipAdress__input')
}

const blockAuthorization = { // Блок авторизации
    block : document.querySelector('.authorization'),
    input : document.querySelector('.authorization__input')
}



blockIPAdress.input.addEventListener('keypress', (event) => { // Ивент для ввода айпи.
    if (event.key === 'Enter') { // Если пользователь нажал ETNER
        connectToServer(); // Пытаемся подлкючится к серверу
    }
});


function connectToServer() {
    const socket = new WebSocket(`ws://${blockIPAdress.input.value}`); // Подключаемся в серверу
    socket.addEventListener('open',() => { // Мы получили соединение с сервером 
        blockIPAdress.block.classList.add('hide'); // Скрываем блок с вводом IP
        blockAuthorization.block.classList.remove('hide'); // Показываем блок с авторизацией
    });
}