const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.handle('fetch-packages', async () => {
    return new Promise((resolve, reject) => {
        exec('adb shell pm list packages', (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout.split('\n').map(line => line.replace('package:', '').trim()).filter(line => line));
            }
        });
    });
});

ipcMain.handle('uninstall-package', async (event, packageName) => {
    return new Promise((resolve, reject) => {
        exec(`adb shell pm uninstall --user 0 ${packageName}`, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
});
