const centerBox = document.querySelector('.box-center'); // Импортируем коробку которая выравнивает по центру
const messagerBlock = document.querySelector('.messager'); // Импортируем блок мессенджера

const blockIPAdress = { // Блок с запросом айпи адресса
    block: document.querySelector('.ipAdress'),
    input: document.querySelector('.ipAdress__input'),
    text : document.querySelector('.ipAdress__text')
}

const blockAuthorization = { // Блок авторизации
    block: document.querySelector('.authorization'),
    input: document.querySelector('.authorization__input'),
    error_info: document.querySelector('.authorization__error'),
    text_input: document.querySelector('.authorization__text') 
}

const blockChat = { // Блок чата
    block : document.querySelector('.chat'),
    messages : document.querySelector('.chat__messages'),
    input : document.querySelector('.chat__inputBlock__container__input'),
    nameBlock : document.querySelector('.chat__name'),
    nameSpan : document.querySelector('.chat__nameText'),
    //buttonToMainChat : document.querySelector('.chat__connectToMainChat'),
    buttonToSend : document.querySelector('.chat__inputBlock__container__buttonSend'),
    scroller : document.querySelector('.messager__scroller')
}

const blockCreateChat = { // Блок создания чата
    block : document.querySelector('.createChat'),
    button : document.querySelector('.createChat__button'),
    //textButton : document.querySelector('.createChat__button__text'),
    blockInput : document.querySelector('.createChat__input'),
    //inputNameChat : document.querySelector('.createChat__input__inputNameChat'),
    //inputPassword : document.querySelector('.createChat__input__inputPassword'),
    //buttonToCreate : document.querySelector('.createChat__buttonToCreate'),
    textError : document.querySelector('.createChat__textError')
}

const blockListChats = { // Блок список чатов
    block : document.querySelector('.listChats'),
    buttonOpenList : document.querySelector('.listChats__buttonOpenList'),
    //textButtonOpenList : document.querySelector('.listChats__buttonOpenList__text'),
    blockList : document.querySelector('.listChats__list'),
    list : document.querySelector('.listChats__list__ul'),
    inputSearch : document.querySelector('.listChats__list__inputSearchChat'),
}

const textConnectToMainChat = 'Перейти в Global Chat';
const textInputIP = 'Введите адресс сервера';
const textPressUsername = 'Введите никнейм';
const textNicknameNotFree = 'Никнейм занят!';
const textNotCorrectNick = 'Никнейм должен состоять от 3 до 20 символов и не должен иметь пробелов';
const textBadPassword = 'Неверный пароль!';
const textChatNoLongerExists = 'Чата больше не существует';
const textPlaceholderPassworForChat = 'Введите пароль';
const textButtonConnectToPrivateChat = 'Подключиться';
const textCreateChat = 'Создать чат';
const textPlaceholderPressNameChat = 'Введите название чата';
const textPlaceholderPressPasswordForChat = 'Введите пароль (необезательно)';
const textOpenList = 'Открыть список чатов';
const textPlaceholderSearchChat = 'Введите чат...';
const textPlaceholderPrintYouMessage = 'Введите ваше сообщение...';
const textTryCreateChat = 'Создать!';
const textCreateChatErrorChatIsExists = 'Чат с таким именим существует!';
const textSelfMessage = 'Вы'; 

let socket;
let clientUID;

blockIPAdress.input.addEventListener('keypress', (event) => { // Ивент для ввода айпи.
    if (event.key === 'Enter') { // Если пользователь нажал ETNER
        socket = connectToServer(); // Пытаемся подлкючится к серверу
    }
});

initText();

function initText() { // Иницилизация текста в блоках
    console.log('init');
    blockIPAdress.text.textContent = textInputIP;

    blockAuthorization.text_input.textContent = textPressUsername;

    //blockChat.buttonToMainChat.textContent = textConnectToMainChat;
    //blockChat.input.placeholder = textPlaceholderPrintYouMessage;

    //blockCreateChat.textButton.textContent = textCreateChat;
    //blockCreateChat.inputNameChat.placeholder = textPlaceholderPressNameChat;
    //blockCreateChat.inputPassword.placeholder = textPlaceholderPressPasswordForChat;
    //blockCreateChat.buttonToCreate.textContent = textTryCreateChat;

    //blockListChats.textButtonOpenList.textContent = textOpenList;
    //blockListChats.inputSearch.placeholder = textPlaceholderSearchChat;
}

function connectToServer() {
    const socket = new WebSocket(`ws://${blockIPAdress.input.value}`); // Подключаемся в серверу

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
                receivedMessage(data).scrollIntoView(); // Вызываем функцию отображение в UI сообщения
                break;
            }
            case 'joinToChat' : {
                const data = response.data;
                console.log(data);
                receivedJoinUserToChat(data).scrollIntoView();
                break;
            }
            case 'leaveFromChat' : {
                const data = response.data;
                console.log(data);
                receivedLeaveUserFromChat(data).scrollIntoView();
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

            case 'tryCreateChat' : {
                callbackFunction(response);
                break;
            }
        }    
    }

    socket.onclose = () => { // Обработка отключение от сервера
        console.log('Close connect server!!!');
        disconnectServer();
    };

    socket.onerror = (event) => { // Обработка ошибок
        console.log("Error connected causes ->");
        console.log(event);
        disconnectServer();
    };
    
    return socket;
}

let socketQueueId = 0;
const requestList = new Array();

blockAuthorization.input.addEventListener('keypress', (event) => { // Делаем ивент на нажатие Ентера для авторизации
    if (event.key === 'Enter') {
        if (isCorrectNickname(blockAuthorization.input.value)) { // Если ник коректный мы отправляем на сервер
            sendRequestAuth(blockAuthorization.input.value);
        } else {
            blockAuthorization.error_info.textContent = textNotCorrectNick;
        }
    }
});

blockChat.input.addEventListener('keypress', (event) => { // Считываем сообщение при нажатия Enter
    if (event.key === 'Enter') {
        if (blockChat.input.value != '') {
            sendMessage(blockChat.input.value);
            blockChat.input.value = '';
        }
    }
});

blockChat.buttonToSend.addEventListener('click', () => { // Считываем сообщение при нажатия на кнопку отправки
    if (blockChat.input.value != '') {
        sendMessage(blockChat.input.value);
        blockChat.input.value = '';
    }
});

//blockChat.buttonToMainChat.addEventListener('click', () => { // При клике отправляем запрос на подключение к главному чату
//    console.log('Click to join global chat');
//    sendRequestJoinToGlobalChat();
//});

//blockCreateChat.button.addEventListener('click', () => { // Открыть закрыть инпуты для создания чата
//    blockCreateChat.blockInput.classList.toggle('hide');
//});

//blockCreateChat.buttonToCreate.addEventListener('click', () => { // Отправляем запрос на создание чата
//    sendRequestTryCreateChat(blockCreateChat.inputNameChat.value, blockCreateChat.inputPassword.value);
//});

//blockCreateChat.inputNameChat.addEventListener('keyup', (event) => { // Отправляем запрос на создание чата
//    if (event.key === 'Enter') {
//        sendRequestTryCreateChat(blockCreateChat.inputNameChat.value, blockCreateChat.inputPassword.value);
//    }
//});

//blockCreateChat.inputPassword.addEventListener('keyup', (event) => { // Отправляем запрос на создание чата
//    if (event.key === 'Enter') {
//        sendRequestTryCreateChat(blockCreateChat.inputNameChat.value, blockCreateChat.inputPassword.value);
//    }
//});

//blockListChats.buttonOpenList.addEventListener('click', () => { // Открыть закрыть чаты

//    if (blockListChats.blockList.classList.contains('hide')) {
//        blockListChats.blockList.classList.remove('hide');
//        console.log('chat list open');
//        sendRequestGetListChat();
//    } else {
//        closeChatList();
//    }

//});

// blockListChats.inputSearch.addEventListener('input', () => { // При вводе текста ищем чат соотвествующий вводу
//     const value = blockListChats.inputSearch.value;
//     const length = value.length;

//     const list = blockListChats.list;

//     for (let i = 0; i < list.children.length; i++) { // Проходимся по каждому элемента списка
//         const element = list.children[i]; // Сохраняем элемент в переменную
//         let nameChat = element.getAttribute('data-name-chat'); // Узнаем значение атрибута названия чата
//         nameChat = nameChat.substring(0, length);
//         if (nameChat.toLowerCase() !== value.toLowerCase()) {
//             console.log('Not Fit item ->')
//             console.log(element);
//             element.classList.add('hide');
//         } else {
//             console.log('Fit item ->');
//             console.log(element);
//             element.classList.remove('hide');
//         }
//     }
// });

function isCorrectNickname(nickname) { // Проверяем ник что бы он состоял от 3 до 20 символов и не должен иметь пробелов
    return nickname.length > 3 && nickname.length <= 20 && !nickname.includes(' ');
}

function isCorrectNameChat(chatName) { // Проверяем имя чата что бы оно состоял от 4 до 15 символов и не должен иметь пробелов
    return chatName.length > 4 && chatName.length <= 15 && !chatName.includes(' ');
}

function receivedElementsChat(data) { // Добавляем сообщения из чата
    const list = JSON.parse(data);
    console.log(`Function receivedElementsChats list ->`);
    console.log(list);

    let lastElement;
    list.slice().reverse().forEach((element) => {
        switch (element.elementName) {
            case 'ConnectDisconnectElement': { // Элемент подключение/отключение от чата
                if (element.connect) { // Элемент подключение
                    lastElement = receivedJoinUserToChat(element);
                } else { // Элемент отключения
                    lastElement = receivedLeaveUserFromChat(element);
                }
                break;
            }
            case 'Message': { // Элемент сообщения
                lastElement = receivedMessage(element); // Добавляем блок сообщения
            }
        }
    });
    
    setTimeout(()=>{lastElement.scrollIntoView();},1); // Таймаут нужен для того что бы успел загрузится наш элемент к которому скролимся
    
    
}

function receivedMessage(data) { // Добавляем блок сообщения в чате

    const blockMessage = document.createElement('li');

    

    blockMessage.classList.add('chat__messages__message');
    blockMessage.id = `element:${data.id}`;

    const blockNickname = document.createElement('span');
    const blockText = document.createElement('span');
    blockNickname.classList.add('chat__messages__message__nickname');
    blockText.classList.add('chat__messages__message__text');

    blockMessage.appendChild(blockNickname);
    blockMessage.appendChild(blockText);
    
    blockText.textContent = data.message;

    if (data.client.uid === clientUID) {
        blockMessage.classList.add('chat__messages__message--self');
        blockNickname.textContent = `${textSelfMessage}:`;
    } else {
        blockNickname.textContent = `${data.client.nickname}:`;
    }

    blockChat.messages.appendChild(blockMessage);

    return blockMessage;

}

function receivedJoinUserToChat(data) { // Добавляем блок присоединение пользователя

    if (!(typeof data === 'object')) {
        data = JSON.parse(data);
    }



    const blockConnect = document.createElement('li');
    blockConnect.classList.add('chat__messages__connect');
    blockConnect.classList.add('chat__messages__networkBox');
    blockConnect.id = `element:${data.id}`;
    console.log(`Element: ${data.client.nickname}`);

    const icon = document.createElement('span');
    icon.classList.add('chat__messages__connect__icon');
    icon.classList.add('chat__messages__networkBox__icon');

    const span = document.createElement('span');
    span.classList.add('chat__messages__connect__text');
    span.classList.add('chat__messages__networkBox__text');
    span.textContent = `${data.client.nickname}`;

    blockConnect.appendChild(icon);
    blockConnect.appendChild(span);
    blockChat.messages.appendChild(blockConnect);

    

    return blockConnect;
}

function receivedLeaveUserFromChat(data) { // Добавляем блок о отключение пользователя

    if (!(typeof data === 'object')) {
        data = JSON.parse(data);
    }

    const blockConnect = document.createElement('li');
    blockConnect.classList.add('chat__messages__disconnect');
    blockConnect.classList.add('chat__messages__networkBox');
    blockConnect.id = `element:${data.id}`;
    console.log(`Element: ${data.client.nickname}`);

    const icon = document.createElement('span');
    icon.classList.add('chat__messages__disconnect__icon');
    icon.classList.add('chat__messages__networkBox__icon');

    const span = document.createElement('span');
    span.classList.add('chat__messages__disconnect__text');
    span.classList.add('chat__messages__networkBox__text');
    span.textContent = `${data.client.nickname}`;

    blockConnect.appendChild(icon);
    blockConnect.appendChild(span);
    blockChat.messages.appendChild(blockConnect);

    return blockConnect;
}

function receivedDeleteElementChat(data) { // Функция удаление элемента из чата
    const element = document.getElementById(`element:${data.id}`);
    element.remove();
}

function receivedTryJoinToChat(data) { // Функция которая проверяет вошел ли пользователь в чат или нет
    console.log("receivedTryJoinToChat DATA ->");
    console.log(data);
    switch (data.code) {
        case 0: {
            closeChatList();
            openButtonForToMain(); // Открываем кнопку подключение к главному чату
            break;
        }
        case 1: {
            const DATA = JSON.parse(data.data);
            const span = document.getElementById(`chatErrorID:${DATA.chatID}`);
            span.textContent = textBadPassword;
            break;
        }

        case 3: {
            const DATA = JSON.parse(data.data);
            const span = document.getElementById(`chatErrorID:${DATA.chatID}`);
            const element = document.getElementById(`chatID:${DATA.chatID}`);
            span.textContent = textChatNoLongerExists;
            setTimeout(() => {
                element.remove();
            }, 3000);
            break;
        }
    }
}

function receivedTryCreateChat(data) { // Функция которая обрабатывает ответ сервера на запрос о создании чата
    console.log('receivedTryCreateChat DATA ->');
    console.log(data);

    switch(data.code) {
        case 0: { // Если все создалось
            blockCreateChat.blockInput.classList.add('hide'); // Скрываем инпуты и очищаем их
            blockCreateChat.inputNameChat.value = '';
            blockCreateChat.inputPassword.value = '';
            openButtonForToMain();
        }
        case 1: { 
            blockCreateChat.textError.textContent = textCreateChatErrorChatIsExists; 
            setTimeout(() => {
                blockCreateChat.textError.textContent = '';
            },3000);
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
    sendDate(request, authorization);
}

function sendRequestGetListChat() { // Отправить запрос на список листа
    const request = {
        type: 'getChatList'
    }
    sendDate(request, gotChatList);
}

function sendReqestTryJoinToChat(id, password) { // Отправить запрос на подключение к чату 
    const request = {
        type: 'tryJoinToChat',
        chatID: id,
        password: password
    }
    sendDate(request, receivedTryJoinToChat);
}

function sendRequestJoinToGlobalChat() { // Отправить запрос на подключение к глобальному чату
    const request = {
        type: 'joinToGlobalChat'
    }
    hideButtonForToMain();
    sendDate(request);
}

function sendRequestTryCreateChat(name, password) { // Создаем запрос на создание чата
    const request = {
        type : 'tryCreateChat',
        name : name,
        password : password
    }
    
    sendDate(request,receivedTryCreateChat);
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

function sendDate(data, callbackFunction) { // Отправка сообщение на сервер c callback
    console.log(`Socket Ready state = ${socket.readyState}`);
    if (socket.readyState === 1) {
        socketQueueId++;
        if (typeof (callbackFunction) == 'function') {
            requestList.push(
                {
                    id: socketQueueId,
                    callbackFunction: callbackFunction
                }
            );
        }
        const request = {
            requestID: socketQueueId,
            data: data
        }
        socket.send(JSON.stringify(request));
    } else {
        console.log('Disconect server');
        disconnectServer();
    }

}

function authorization(response) { // Авторизация
    switch (response.code) {
        case 0: { // Если все отлично от скрываем блок ввода имени и открываем чат

            const client = JSON.parse(response.data);

            clientUID = client.uid;

            blockAuthorization.input.value = '';
            blockAuthorization.block.classList.add('hide');
            //blockListChats.block.classList.remove('hide');
            blockChat.block.classList.remove('hide');
            blockAuthorization.error_info.textContent = '';
            centerBox.classList.add('hide'); // Скрываем коробку которая выравнивает по центру
            messagerBlock.classList.remove('hide'); // Включаем внутриность мессенджера

            break;
        }
        case 1: { // Ник занят 
            blockAuthorization.error_info.textContent = textNicknameNotFree;
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
        inputPassword.placeholder = textPlaceholderPassworForChat; // Устанавливаем плейсхолдер
        buttonConnect.textContent = textButtonConnectToPrivateChat; // Устанавливаем текстовый конент кнопки
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

function closeChatList() { // Закрыть чат лист
    blockListChats.blockList.classList.add('hide');
    console.log('chat list hide');
    clearChatList();
}

function clearChatList() { // Очищаем весь список чатов
    console.log('Remove childer for chat list')
    while (blockListChats.list.firstChild) {
        blockListChats.list.firstChild.remove();
    }
}

function clearChat() { // Очищаем весь чат
    console.log('Clear chat');
    while (blockChat.messages.firstChild) {
        blockChat.messages.firstChild.remove();
    }
}

function clearNameChat() { // Очищаем имя чата
    blockChat.nameSpan.textContent = ''
}

function clearAll() { // Очищаем все что мы получили от сервера
    clearChat();
    clearChatList();
    clearNameChat();
}

function openButtonForToMain() { // Открыть кнопку подключение к главному чату
    blockChat.buttonToMainChat.classList.remove('hide');
}

function hideButtonForToMain() { // Скрыть кнопку подключение к главному чату
    blockChat.buttonToMainChat.classList.add('hide');
}

function disconnectServer() { // Функция отключение от сервера
    blockIPAdress.block.classList.remove('hide'); // Убираем с инпута ip скрытие
    resetHideClasses(); // Ставим классы по дефолту
    clearAll(); // Очищаем все данные
    socket.close();
}

function resetHideClasses() { // Установить класс "hide" всем элементам которые имеют его изначально
    centerBox.classList.remove('hide'); // Открываем бокс для центра
    
    messagerBlock.classList.add('hide'); // Скрываем месенджер

    blockChat.block.classList.add('hide'); // Скрываем блок чата
    blockAuthorization.block.classList.add('hide'); // Скрываем блок авторизации
    blockChat.block.classList.add('hide'); // Скрываем чат
    //blockChat.buttonToMainChat.classList.add('hide'); // Скрываем кнопку выхода в глобальный чат

    //blockCreateChat.block.classList.add('hide'); // Скрыть создание чата
    blockCreateChat.blockInput.classList.add('hide'); // Скрыть инпуты у создания чата

    blockListChats.block.classList.add('hide'); // Скрыть блок списка чатов
    blockListChats.blockList.classList.add('hide'); // Скрыть список чатов
}