const blockIPAdress = { // Блок с запросом айпи адресса
    block: document.querySelector('.ipAdress'),
    input: document.querySelector('.ipAdress__input')
}

const blockAuthorization = { // Блок авторизации
    block: document.querySelector('.authorization'),
    input: document.querySelector('.authorization__input')
}

const blockChat = { // Блок чата
    block : document.querySelector('.chat'),
    messages : document.querySelector('.chat__messages'),
    input : document.querySelector('.chat__input')
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
        if (response.type === null) {
                requestList.forEach((object)=>{
                if (object.id == response.requestID) {
                    object.callbackFunction(response);
                }
                delete object;
                return;
            });
        } else {
            if (response.type === 'message') {
                const data = JSON.parse(response.response);
                console.log(data);
                receivedMessage(data.nickname,data.message);
            }
        }
        
    }

    blockAuthorization.input.addEventListener('keypress', (event) => { // Делаем ивент на нажатие Ентера для авторизации
        if (event.key === 'Enter') {
            if (isCorrectNickname(blockAuthorization.input.value)) { // Если ник коректный мы отправляем на сервер
                sendRequestAuth(blockAuthorization.input.value);
            }
        }
    });

    blockChat.input.addEventListener('keypress',(event) => {
        if (event.key === 'Enter') {
            sendMessage(blockChat.input.value);
            blockChat.input.value = '';
        }
    });

    function isCorrectNickname(nickname) {
        return nickname.length > 3 && nickname.length <= 20 && !nickname.includes(' ');
    }

    function receivedMessage(nickname,message) { // Добавляем блок сообщения в чате

        const blockMessage = document.createElement('div');
        blockMessage.classList.add('chat__message');

        const blockNickname = document.createElement('span');
        const blockText = document.createElement('span');
        blockNickname.classList.add('chat__nickname');
        blockText.classList.add('chat__text');

        blockMessage.appendChild(blockNickname);
        blockMessage.appendChild(blockText);
        blockNickname.textContent = `${nickname}: `;
        blockText.textContent = message;

        blockChat.messages.appendChild(blockMessage);
        
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
            blockAuthorization.block.classList.add('hide');
            blockChat.block.classList.remove('hide');
        }
    }
}