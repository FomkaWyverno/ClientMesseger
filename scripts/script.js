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

const blockCreateChat = { // Блок создания чата
    block : document.querySelector('.createChat'),
    button : document.querySelector('.createChat__button'),
    blockInput : document.querySelector('.createChat__input'),
    inputNameChat : document.querySelector('.createChat__input__inputNameChat'),
    inputPassword : document.querySelector('.createChat__input__inputPassword')
}

const blockListChats = { // Блок список чатов
    block : document.querySelector('.listChats'),
    buttonOpenList : document.querySelector('.listChats__buttonOpenList'),
    blockList : document.querySelector('.listChats__list'),
    list : document.querySelector('.listChats__list__ul'),
    inputSearch : document.querySelector('.listChats__list__inputSearchChat')
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
                callbackFunction(response);
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
            case 'leaveFromChat' : {
                const data = response.data;
                console.log(data);
                receivedLeaveUserFromChat(data);
                break;
            }
            case 'listElementChat' : {
                receivedElementsChat(response.data); // Добавляем присуствующие элементы в чат
                break;
            }
            case 'selfJoinToChat' : {
                const nameChat = response.data;
                console.log(nameChat);
                clearChat();
                blockChat.nameSpan.textContent = nameChat;
                break;
            }
            case 'deleteElement' : {
                const message = JSON.parse(response.data);
                receivedDeleteElementChat(message);
            }

            case 'gotChatList' : {
                callbackFunction(response);
                break;
            }

            case 'tryJoinToChat' : {
                callbackFunction(response);
                break;
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

    blockCreateChat.button.addEventListener('click', () => { // Открыть закрыть инпуты для создания чата
        blockCreateChat.blockInput.classList.toggle('hide');
    });

    blockListChats.buttonOpenList.addEventListener('click', () => { // Открыть закрыть чаты
        
        if (blockListChats.blockList.classList.contains('hide')) {
            blockListChats.blockList.classList.remove('hide');
            console.log('chat list open');
            sendRequestGetListChat();
        } else {
            closeChatList();
        }
        
    });

    blockListChats.inputSearch.addEventListener('input', () => { // При вводе текста ищем чат соотвествующий вводу
        const value = blockListChats.inputSearch.value;
        const length = value.length;

        const list = blockListChats.list;
        
        for (let i = 0; i < list.children.length; i++) { // Проходимся по каждому элемента списка
            const element = list.children[i]; // Сохраняем элемент в переменную
            let nameChat = element.getAttribute('data-name-chat'); // Узнаем значение атрибута названия чата
            nameChat = nameChat.substring(0,value.length);
            if (nameChat.toLowerCase() !== value.toLowerCase()) {
                console.log('Not Fit item ->')
                console.log(element);
                element.classList.add('hide');
            } else {
                console.log('Fit item ->');
                console.log(element);
                element.classList.remove('hide'); 
            }
        }
    });

    function isCorrectNickname(nickname) {
        return nickname.length > 3 && nickname.length <= 20 && !nickname.includes(' ');
    }

    function receivedElementsChat(data) { // Добавляем сообщения из чата
        const list = JSON.parse(data);
        console.log(`Function receivedElementsChats list ->`);
        console.log(list);
        list.slice().reverse().forEach((element) =>{
            switch (element.elementName) {
                case 'ConnectDisconnectElement' : { // Элемент подключение/отключение от чата
                    if (element.connect) { // Элемент подключение
                        receivedJoinUserToChat(element);
                    } else { // Элемент отключения
                        receivedLeaveUserFromChat(element);
                    }
                    break;
                }
                case 'Message' : { // Элемент сообщения
                    receivedMessage(element); // Добавляем блок сообщения
                }
            }
        });
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
        
        if (!(typeof data === 'object')) {
            data = JSON.parse(data);
        } 
        
        
        
        const blockConnect = document.createElement('div');
        blockConnect.classList.add('chat__connect');
        blockConnect.id = `element:${data.id}`;
        console.log(`Element: ${data.name}`);
        const span = document.createElement('span');
        span.textContent = `${data.name} присоединился к чату.`;
        blockConnect.appendChild(span);
        blockChat.messages.appendChild(blockConnect);
    }

    function receivedLeaveUserFromChat(data) { // Добавляем блок о отключение пользователя
        
        if (!(typeof data === 'object')) {
            data = JSON.parse(data);
        }
        
        const blockConnect = document.createElement('div');
        blockConnect.classList.add('chat__disconnect');
        blockConnect.id = `element:${data.id}`;
        console.log(`Element: ${data.name}`);
        const span = document.createElement('span');
        span.textContent = `${data.name} покинул чат.`;
        blockConnect.appendChild(span);
        blockChat.messages.appendChild(blockConnect);
    }

    function receivedDeleteElementChat(data) { // Функция удаление элемента из чата
        const element = document.getElementById(`element:${data.id}`);
        element.remove();
    }

    function receivedTryJoinToChat(data) { // Функция которая проверяет вошел ли пользователь в чат или нет
        console.log("receivedTryJoinToChat DATA ->");
        console.log(data);
        switch (data.code) {
            case 0 : {
                closeChatList();
                break;
            }
            case 1 : {
                const DATA = JSON.parse(data.data);
                const span = document.getElementById(`chatErrorID:${DATA.chatID}`);
                span.textContent = 'Неверный пароль!';
                break;
            }

            case 3 : {
                const DATA = JSON.parse(data.data);
                const span = document.getElementById(`chatErrorID:${DATA.chatID}`);
                const element = document.getElementById(`chatID:${DATA.chatID}`);
                span.textContent = 'Чата больше не существует';
                setTimeout(() =>{
                    element.remove();
                },3000);
                break;
            }
        }
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

    function sendRequestGetListChat() { // Отправить запрос на список листа
        const request = {
            type : 'getChatList'
        }
        sendDate(request,gotChatList);
    }

    function sendReqestTryJoinToChat(id, password) { // Отправить запрос на подключение
        const request = {
            type : 'tryJoinToChat',
            chatID : id,
            password : password
        }
        sendDate(request,receivedTryJoinToChat);
    }

    function callbackFunction(response) { // Функция поиска калл бэк функции и вызова её
        requestList.forEach((object) => { // Перебираем список запросов которые мы сделали
            if (object.id == response.requestID) { // Если мы нашли наш запрос
                object.callbackFunction(response); // Берем ссылку на функцию и вызываем её с аргументом ответа сервера
            }
            delete object; // Удаляем обьект запроса который мы сохраняли
            return; // Завершаем поиск
        });
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
                blockCreateChat.block.classList.remove('hide');
                blockListChats.block.classList.remove('hide');
                blockChat.block.classList.remove('hide');
                break;
            }
            case 1 : { // Ник занят 
                blockAuthorization.error_info.textContent = response.data;
                break;
            }
        }
    }

    function gotChatList(response) { // Получение списка
        console.log('Got Chat List ->');
        console.log(response);
        
        const chatList = JSON.parse(response.data);

        console.log('Chat list -> ');
        console.log(chatList);

        chatList.forEach(chat => { // Проходимся по всему списку чату
            const elementList = document.createElement('li'); // Создаем элемент списка
            elementList.classList.add('listChats__list__ul__element'); // Добавляем ему класс

            const chatElement = document.createElement('div'); // Создаем чат элемент
            chatElement.classList.add('chatElement'); // Добавляем ему класс

            elementList.appendChild(chatElement); // Добавлям в Элемент списка Чат Элемент

            const nameChat = document.createElement('span'); // Создаем спан имени чата
            const inputPassword = document.createElement('input'); // Создаем инпут для пароля
            const buttonConnect = document.createElement('button'); // Создаем кнопку для присоидинения к чату
            const textError = document.createElement('span'); // Создаем спан для вывода ошибки
            nameChat.textContent = chat.nameChat; // Устанавливаем название чата
            elementList.dataset.nameChat = chat.nameChat; // Устанавливаем атрибут данных имя чата
            inputPassword.type = 'password'; // Ставим тип инпута пароль
            inputPassword.placeholder = 'Введите пароль'; // Устанавливаем плейсхолдер
            buttonConnect.textContent = 'Подключиться'; // Устанавливаем текстовый конент кнопки
            nameChat.classList.add('chatElement__nameChat'); // Добавляем класс для имени чата
            inputPassword.classList.add('chatElement__inputPassword'); // Добавляем класс для инпута пароля
            buttonConnect.classList.add('chatElement__button'); // Добавляем класс для кнопки подключения
            textError.classList.add('chatElement__textError'); // Добавляем класс для отображение текста ошибки

            if (!chat.hasPassword) { // Если нету пароля у чата
                inputPassword.classList.add('hide'); // Скрываем поле ввода для пароля
                elementList.dataset.hasPassword = 'false'; // Ставим атрибут что чат не имеет пароля
            } else { // Иначе
                elementList.dataset.hasPassword = 'true'; // Ставим атрибут что чат имеет пароль
            }

            buttonConnect.addEventListener('click', () => { // При клике отправляем запрос на подключение к чату 
                sendReqestTryJoinToChat(chat.id, inputPassword.value);
            });

            inputPassword.addEventListener('keypress', (event) => { // При нажатия на ENTER отправляем запрос на подключение к чату 
                if (event.key === 'Enter') {
                    sendReqestTryJoinToChat(chat.id, inputPassword.value);
                }
            }); 

            inputPassword.addEventListener('input', () => { // При вводе удаляем причину ошибки подключения к чату
                textError.textContent = '';
            });

            chatElement.appendChild(nameChat); // Добавляем имя чата в чат элемент
            chatElement.appendChild(inputPassword); // Добавляем инпут пароля в чат элемент
            chatElement.appendChild(buttonConnect); // Добавляем кнопку подключения в чат элемент
            chatElement.appendChild(textError); // Добавляем текстовую ошибку в чат элемент

            textError.id = `chatErrorID:${chat.id}`; // Устанавливаем спану который выводит ошибку id
            elementList.id = `chatID:${chat.id}`; // Устанавливаем элементу id

            blockListChats.list.appendChild(elementList); // Добавляем элемент листа в лист
        });
    }

    function clearChatList() { // Очищаем весь список чатов
        console.log('Remove childer for chat list')
        while (blockListChats.list.firstChild) {
            blockListChats.list.firstChild.remove();
        }
    } 

    function closeChatList() { // Закрыть чат лист
        blockListChats.blockList.classList.add('hide');
        console.log('chat list hide');
        clearChatList();
    }

    function clearChat() { // Очищаем весь чат
        console.log('Clear chat');
        while (blockChat.messages.firstChild) {
            blockChat.messages.firstChild.remove();
        }
    }
}