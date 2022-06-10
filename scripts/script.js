const blockIPAdress = { // Блок с запросом айпи адресса
    block: document.querySelector('.ipAdress'),
    input: document.querySelector('.ipAdress__input')
}

const blockAuthorization = { // Блок авторизации
    block: document.querySelector('.authorization'),
    input: document.querySelector('.authorization__input'),
    error_info: document.querySelector('.authorization__error')
}

const blockChat = { // Блок чата
    block : document.querySelector('.chat'),
    messages : document.querySelector('.chat__messages'),
    input : document.querySelector('.chat__input'),
    nameBlock : document.querySelector('.chat__name'),
    nameSpan : document.querySelector('.chat__nameText')
}


blockIPAdress.input.addEventListener('keypress', (event) => { // Ивент для ввода айпи.
    if (event.key === 'Enter') { // Если пользователь нажал ETNER
        connectToServer(); // Пытаемся подлкючится к серверу
    }
});


function connectToServer() {
    const socket = new WebSocket(`ws://${blockIPAdress.input.value}`); // Подключаемся в серверу

    let socketQueueId = 0;
    const requestList = new Array();

    socket.onopen = () => { // Мы получили соединение с сервером 
        blockIPAdress.block.classList.add('hide'); // Скрываем блок с вводом IP
        blockAuthorization.block.classList.remove('hide'); // Показываем блок с авторизацией
    };

    socket.onmessage = (event) => { // Обработка сообщений от сервера
        const response = JSON.parse(event.data);
        console.log(response);
        switch(response.type) {
            case 'authorization' : { // Тип сообщение от сервера авторизация
                requestList.forEach((object) => { // Перебираем список запросов которые мы сделали
                    if (object.id == response.requestID) { // Если мы нашли наш запрос
                        object.callbackFunction(response); // Берем ссылку на функцию и вызываем её с аргументом ответа сервера
                    }
                    delete object; // Удаляем обьект запроса который мы сохраняли
                    return; // Завершаем поиск
                });
                break;
            }
            case 'message' : { // Тип сообщение от сервера пришло сообщение
                const data = JSON.parse(response.data); // Парсим данные которые пришли нам
                console.log(data);
                receivedMessage(data); // Вызываем функцию отображение в UI сообщения
                break;
            }
            case 'joinToChat' : {
                const data = response.data;
                console.log(data);
                receivedJoinUserToChat(data);
                break;
            }
            case 'listMessages' : {
                const list = JSON.parse(response.data);
                console.log(list);
                list.slice().reverse().forEach((data) => {
                    receivedMessage(data);
                });
                break;
            }
            case 'setNameChat' : {
                const nameChat = response.data;
                console.log(nameChat);
                blockChat.nameSpan.textContent = nameChat;
                break;
            }
            case 'deleteElement' : {
                const message = JSON.parse(response.data);
                receivedDeleteElementChat(message);
            }
        }    
    }

    blockAuthorization.input.addEventListener('keypress', (event) => { // Делаем ивент на нажатие Ентера для авторизации
        if (event.key === 'Enter') {
            if (isCorrectNickname(blockAuthorization.input.value)) { // Если ник коректный мы отправляем на сервер
                sendRequestAuth(blockAuthorization.input.value);
            } else {
                blockAuthorization.error_info.textContent = 'Никнейм должен состоять от 3 до 20 символов и не должен иметь пробелов'
            }
        }
    });

    blockChat.input.addEventListener('keypress',(event) => { // Считываем сообщении при нажатия Enter
        if (event.key === 'Enter') {
            if (blockChat.input.value != '') {
                sendMessage(blockChat.input.value);
            blockChat.input.value = '';
            }
        }
    });

    function isCorrectNickname(nickname) {
        return nickname.length > 3 && nickname.length <= 20 && !nickname.includes(' ');
    }

    function receivedMessage(data) { // Добавляем блок сообщения в чате

        const blockMessage = document.createElement('div');
        blockMessage.classList.add('chat__message');
        blockMessage.id = `element:${data.id}`;

        const blockNickname = document.createElement('span');
        const blockText = document.createElement('span');
        blockNickname.classList.add('chat__nickname');
        blockText.classList.add('chat__text');

        blockMessage.appendChild(blockNickname);
        blockMessage.appendChild(blockText);
        blockNickname.textContent = `${data.nickname}: `;
        blockText.textContent = data.message;

        blockChat.messages.appendChild(blockMessage);
        
    }

    function receivedJoinUserToChat(data) { // Добавляем блок присоединение пользователя
        data = JSON.parse(data);
        const blockConnect = document.createElement('div');
        blockConnect.classList.add('chat__connect');
        blockConnect.id = `element:${data.id}`;
        console.log(`Element: ${data.name}`);
        const span = document.createElement('span');
        span.textContent = `Присоеденилися ${data.name} к чату.`;
        blockConnect.appendChild(span);
        blockChat.messages.appendChild(blockConnect);
    }

    function receivedDeleteElementChat(data) {
        const element = document.getElementById(`element:${data.id}`);
        element.remove();
    }

    function sendMessage(message) { // Отправить сообщение
        const request = {
            type: "message",
            message: message
        }
        sendDate(request);
    }

    function sendRequestAuth(nickname) { // Отправить на проверку никнейм
        const request = {
            type: "authorization",
            nickname: nickname
        };
        sendDate(request,authorization);
    }

    function sendDate(data,callbackFunction) { // Отправка сообщение на сервер c callback
        socketQueueId++;
        if (typeof(callbackFunction) == 'function') {
            requestList.push(
                {
                    id: socketQueueId,
                    callbackFunction: callbackFunction
                }
                );
        }
        const request = {
            requestID: socketQueueId,
            data:data
        }
        socket.send(JSON.stringify(request));
    }

    function authorization(response) { // Авторизация
        if (response.code == 0) { // Если все отлично от скрываем блок ввода имени и открываем чат
            
        }

        switch (response.code) {
            case 0 : { // Если все отлично от скрываем блок ввода имени и открываем чат
                blockAuthorization.block.classList.add('hide');
                blockChat.block.classList.remove('hide');
                break;
            }
            case 1 : { // Ник занят 
                blockAuthorization.error_info.textContent = response.data;
                break;
            }
        }
    }
}