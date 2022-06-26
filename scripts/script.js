const centerBox = document.querySelector('.box-center'); // Импортируем коробку которая выравнивает по центру
const messagerBlock = document.querySelector('.messager'); // Импортируем блок мессенджера

const windowOtherFunction = {
    block : document.querySelector('.window'),
    controlWindow : {
        windowName : document.querySelector('.window__wrapper__controlPanel__name'),
        close : document.querySelector('.window__wrapper__controlPanel__close')
    },
    content : {
        listChat : document.querySelector('.wrapper__listChat'),
        passwordForJoinChat : {
            block : document.querySelector('.wrapper__passwordForChat'),
            input : document.querySelector('.window__wrapper__content__passwordForChat__inputBlock__input'),
            button : document.querySelector('.window__wrapper__content__passwordForChat__tryButton')
        },
        createChat : document.querySelector('.wrapper__createChat')
    }
    
}

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
    buttonToMainChatBlock : document.querySelector('.window__wrapper__content__backToMainChat'),
    buttonToMainChat : document.querySelector('.window__wrapper__content__backToMainChat__button'),
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
    //blockList : document.querySelector('.listChats__list'),
    list : document.querySelector('.window__wrapper__content__listChat'),
    inputSearch : document.querySelector('.window__wrapper__content__inputBlockSearch__input'),
    emptyList : document.querySelector('.window__wrapper__content__listChat__empty')
}

const textConnectToMainChat = 'Перейти в Global Chat';
const textInputIP = 'Введите адресс сервера';
const textPressUsername = 'Введите никнейм';
const textNicknameNotFree = 'Никнейм занят!';
const textNotCorrectNick = 'Никнейм должен состоять от 3 до 20 символов и не должен иметь пробелов';
const textBadPassword = 'Неверный пароль!';
const textChatNoLongerExists = 'Чата больше не существует';
const textPlaceholderPassworForChat = 'Введите пароль...';
const textButtonConnectToPrivateChat = 'Подключиться';
const textCreateChat = 'Создать чат';
const textPlaceholderPressNameChat = 'Введите название чата';
const textPlaceholderPressPasswordForChat = 'Введите пароль (необезательно)';
const textOpenList = 'Открыть список чатов';
const textListChat = 'Список чатов';
const textPlaceholderSearchChat = 'Введите чат...';
const textPlaceholderPrintYouMessage = 'Введите ваше сообщение...';
const textTryCreateChat = 'Создать!';
const textCreateChatErrorChatIsExists = 'Чат с таким именим существует!';
const textSelfMessage = 'Вы';
const textEmptyChatList = 'Список пуст!';

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
    blockListChats.emptyList.textContent = textEmptyChatList;
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
                closeWindowOtherFunction();
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

const defaultHideElement = document.querySelectorAll('.hide');

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

windowOtherFunction.controlWindow.close.addEventListener('click', () => { // Закрытия окна после нажатия на крестик окна
    closeWindowOtherFunction();
});

windowOtherFunction.content.passwordForJoinChat.button.addEventListener('click', () => { // Отправить запрос на подключение к чату с паролем
    sendReqestTryJoinToChat(
        windowOtherFunction.content.passwordForJoinChat.button.getAttribute('data-chat-id')
        ,windowOtherFunction.content.passwordForJoinChat.input.value);
});

windowOtherFunction.content.passwordForJoinChat.input.addEventListener('keypress', (event) => { // Отправить запрос на подключение к чату с паролем
    if (event.key === 'Enter') {
        sendReqestTryJoinToChat(
            windowOtherFunction.content.passwordForJoinChat.button.getAttribute('data-chat-id')
            ,windowOtherFunction.content.passwordForJoinChat.input.value);
    }
});

blockCreateChat.button.addEventListener('click', () => { // Открыть закрыть инпуты для создания чата
   openCreateChat();
});

blockListChats.buttonOpenList.addEventListener('click', () => { // Открыть закрыть чаты
    openChatList();
    sendRequestGetListChat();
});

blockListChats.inputSearch.addEventListener('input', () => { // Когда вводят текст для поиска чата
    const input = blockListChats.inputSearch;
    const value = input.value.toLowerCase();
    const length = value.length;
    const list = blockListChats.list;

    const lengthList = list.children.length;
    let counterHidedElement = 1;
    for (let i = 0; i < lengthList; i++) { // Проходимся по каждому элемента списка
        const element = list.children[i];
        if (element.hasAttribute('data-name-chat')) {
            const elementChatName = element.getAttribute('data-name-chat');
            const subStringChatName = elementChatName.substring(0, length);

            if (value == subStringChatName) {
                element.classList.remove('hide');
            } else {
                element.classList.add('hide');
                counterHidedElement++;
            }
        }
    }
    console.log(`lenght list = ${lengthList} counter = ${counterHidedElement} boolean = ${lengthList == counterHidedElement}`);
    if (lengthList == counterHidedElement) {
        blockListChats.emptyList.classList.remove('hide');
    } else {
        blockListChats.emptyList.classList.add('hide');
    }
});

blockChat.buttonToMainChat.addEventListener('click', () => {
    sendRequestJoinToGlobalChat();
});

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
    
    setTimeout(()=>{lastElement.scrollIntoView();},10); // Таймаут нужен для того что бы успел загрузится наш элемент к которому скролимся
    
    
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
            openButtonForToMain(); // Открываем кнопку подключение к главному чату
            break;
        }
        case 1: {
            const DATA = JSON.parse(data.data);
            windowOtherFunction.content.passwordForJoinChat.input.placeholder = textBadPassword;
            windowOtherFunction.content.passwordForJoinChat.input.classList.add('badPasswordPlaceholder');
            windowOtherFunction.content.passwordForJoinChat.input.value = '';
            setTimeout(()=>{
                windowOtherFunction.content.passwordForJoinChat.input.classList.remove('badPasswordPlaceholder');
                windowOtherFunction.content.passwordForJoinChat.input.placeholder = textPlaceholderPassworForChat;
            },3000);
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

    if (chatList.length !== 0) {
        chatList.forEach(chat => { // Проходимся по всему списку чату
            
            // <li class="window__wrapper__content__listChat__element">
            //     <span class="window__wrapper__content__listChat__element__name">${chat.nameChat}</span>
            //     <button class="window__wrapper__content__listChat__element__button" id="buttonConnectToChat:${chat.id}">${textButtonConnectToPrivateChat}</button>
            // </li>

            const li = document.createElement('li'); // Создаем элемент листа
            li.classList.add('window__wrapper__content__listChat__element');
            li.dataset.nameChat = chat.nameChat.toLowerCase(); // Добавляем айди элемента

            const span = document.createElement('span'); // Создаем элемента названия чата
            span.classList.add('window__wrapper__content__listChat__element__name'); // Добавляем класс
            span.textContent = chat.nameChat; // Устанавливаем имя

            const button = document.createElement('button'); // Создаем кнопку
            button.classList.add('window__wrapper__content__listChat__element__button'); // Добавляем класс для кнопки
            //button.id = `buttonConnectToChat:${chat.id}`; // Добавляем айди для кнопки
            button.textContent = textButtonConnectToPrivateChat; // Устанавливаем описание кнопки

            li.appendChild(span);
            li.appendChild(button);

            blockListChats.list.appendChild(li);

            button.addEventListener('click',() => {
                if (chat.hasPassword) {
                    openPasswordForChat(chat.id,chat.nameChat);
                } else {
                    sendReqestTryJoinToChat(chat.id,'');
                }
            });
        });
    } else {
        blockListChats.emptyList.classList.remove('hide');    
    }
    
}

function clearChatList() { // Очищаем весь список чатов
    console.log('Remove childer for chat list');
    const list = blockListChats.list.children;

    for (let i = 0; i < list.length; i++) {
        if (list[i].classList.contains('window__wrapper__content__listChat__element')) {
            list[i].remove();
        }
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
    blockChat.buttonToMainChatBlock.classList.remove('hide');
}

function hideButtonForToMain() { // Скрыть кнопку подключение к главному чату
    blockChat.buttonToMainChatBlock.classList.add('hide');
}

function disconnectServer() { // Функция отключение от сервера
    blockIPAdress.block.classList.remove('hide'); // Убираем с инпута ip скрытие
    resetHideClasses(); // Ставим классы по дефолту
    centerBox.classList.remove('hide');
    clearAll(); // Очищаем все данные
    socket.close();
}

function resetHideClasses() { // Установить класс "hide" всем элементам которые имеют его изначально
    defaultHideElement.forEach(element => {
        element.classList.add('hide');
    });
}

function openWindowOtherFunction() { // Открыть окно других функций
    windowOtherFunction.block.classList.remove('hide');
}

function closeWindowOtherFunction() { // Закрыть окно других функций
    windowOtherFunction.block.classList.add('hide');
    hideLayerInWindowOtherFunction();
    clearChatList();
}

function hideLayerInWindowOtherFunction() { // Скрыть все что имеет внутри себя окно других функций
    windowOtherFunction.content.createChat.classList.add('hide');
    windowOtherFunction.content.listChat.classList.add('hide');
    windowOtherFunction.content.passwordForJoinChat.block.classList.add('hide');
}

function setNameWindowOtherFunction(name) { // Установить имя окна
    windowOtherFunction.controlWindow.windowName.textContent = name;
}

function openCreateChat() {
    openWindowOtherFunction();
    setNameWindowOtherFunction(textCreateChat);
    windowOtherFunction.content.createChat.classList.remove('hide');
}

function openChatList() {
    openWindowOtherFunction();
    setNameWindowOtherFunction(textListChat);
    windowOtherFunction.content.listChat.classList.remove('hide');
}

function openPasswordForChat(chatID,nameChat) {
    setNameWindowOtherFunction(nameChat);
    windowOtherFunction.content.passwordForJoinChat.block.classList.remove('hide');
    windowOtherFunction.content.listChat.classList.add('hide');
    
    windowOtherFunction.content.passwordForJoinChat.button.dataset.chatId = chatID;
}