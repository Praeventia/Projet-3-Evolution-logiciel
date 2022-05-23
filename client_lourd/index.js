const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

let mainWindow;
let chatWindow;

function initWindow() {
    mainWindow = new BrowserWindow({
        height: 1080,
        width: 1920,
        icon: path.join(__dirname, '/dist/client/favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    // Electron Build Path
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/client/index.html`),
            protocol: 'file:',
            slashes: true,
        }),
    );

    // Initialize the DevTools.
    //appWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('browser-window-created', function (e, window) {
    window.setMenuBarVisibility(false);
});

app.on('ready', initWindow);

function openChatWindow() {
    chatWindow = new BrowserWindow({
        width: 328,
        height: 750,
        minWidth: 328,
        modal: false,
        show: false,
        frame: false,
        parent: mainWindow,
        icon: path.join(__dirname, '/dist/client/favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    chatWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/client/index.html`),
            hash: '/chat',
            protocol: 'file:',
            slashes: true,
        }),
    );

    chatWindow.once('ready-to-show', () => {
        chatWindow.show();
    });

    chatWindow.on('closed', () => {
        chatWindow = null;
    });
}

ipcMain.on('open-chat-window', (event, arg) => {
    openChatWindow();
});

ipcMain.on('close-chat-window', (e) => {
    chatWindow?.close();
    mainWindow.webContents.send('chat-window-closed');
});

ipcMain.on('external-chat-disconnected', (e) => {
    chatWindow?.close();
    mainWindow.webContents.send('external-chat-disconnected');
});

// Close when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (win === null) {
        initWindow();
    }
});
