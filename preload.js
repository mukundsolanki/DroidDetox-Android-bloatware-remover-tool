const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    fetchPackages: () => ipcRenderer.invoke('fetch-packages'),
    uninstallPackage: (packageName) => ipcRenderer.invoke('uninstall-package', packageName)
});
