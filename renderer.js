const { ipcRenderer } = require('electron');

document.getElementById('fetch-packages').addEventListener('click', async () => {
    const packages = await ipcRenderer.invoke('fetch-packages');
    const packageList = document.getElementById('package-list');
    packageList.innerHTML = '';
    packages.forEach(pkg => {
        const listItem = document.createElement('li');
        listItem.textContent = pkg;

        const uninstallButton = document.createElement('button');
        uninstallButton.textContent = 'Uninstall';
        uninstallButton.style.marginLeft = '10px';
        uninstallButton.addEventListener('click', () => confirmUninstall(pkg));

        listItem.appendChild(uninstallButton);
        packageList.appendChild(listItem);
    });
});

function confirmUninstall(packageName) {
    const confirmation = confirm(`Are you sure you want to delete the package ${packageName}? This action cannot be undone.`);
    if (confirmation) {
        uninstallPackage(packageName);
    }
}

async function uninstallPackage(packageName) {
    try {
        const result = await ipcRenderer.invoke('uninstall-package', packageName);
        alert(`Successfully uninstalled: ${packageName}`);
    } catch (error) {
        alert(`Failed to uninstall: ${packageName}\nError: ${error}`);
    }
}
