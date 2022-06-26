const path = require('path');
const url = require('url');
const {app, BrowserWindow, ipcMain} = require('electron');
const ipc = ipcMain;

let win;

function createWindow () {
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        minHeight: 800,
        minWidth: 720,
        show: false,
        frame: false,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation:false, // Убираем изоляцию HTML для того что бы можно было подключить IPC
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname,'/src/index.html'),
        protocol: 'file',
        slashes: true
    }));

    win.webContents.openDevTools();

    win.setMenu(null);

    win.once('ready-to-show', () => {
        win.show();
    });

    win.on('close', () => {
        win = null;
    });

    ipc.on('hide', () => { // Принимаем от клиента нажатие на скрытие окна
        win.minimize();
    });

    ipc.on('expand', (skip,data) => { // Принимаем от клиента нажатие на развертвувание окна
        if (data == 1) {
            win.maximize();
        } else {
            win.restore();
        }
    });

    ipc.on('close', () => { // Принимаем от клиента нажатие на закрытие окна
        win.close();
    });

    win.on('maximize', () => { // Отправляем клиенту что окно развернулось
        win.webContents.send('maximize');
    });
    win.on('unmaximize', () => { // Отправляем клиенту что окно уменьшено
        win.webContents.send('unmaximize');
    });
}

app.on('ready', createWindow);

console.log('App is runned');

app.on('window-all-closed', () => {
    app.quit();
});
