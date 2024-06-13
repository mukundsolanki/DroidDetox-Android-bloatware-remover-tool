const { app, BrowserWindow, ipcMain } = require('electron');
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

ipcMain.handle('check-device', async () => {
    return new Promise((resolve, reject) => {
        exec('adb devices', (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                const devices = stdout.split('\n').slice(1).map(line => line.split('\t')[0]).filter(line => line);
                resolve(devices.length > 0);
            }
        });
    });
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

ipcMain.handle('get-device-name', async () => {
    return new Promise((resolve, reject) => {
        exec('adb shell getprop ro.product.model', (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout.trim());
            }
        });
    });
});
