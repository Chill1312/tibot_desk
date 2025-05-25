const { autoUpdater } = require('electron-updater');
const { ipcMain } = require('electron');
require('dotenv').config();

// Configuration des logs de mise à jour
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

// Configuration de l'auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Configuration du token GitHub
if (process.env.GH_TOKEN) {
    autoUpdater.requestHeaders = {
        Authorization: `token ${process.env.GH_TOKEN}`
    };
} else {
    console.warn('GH_TOKEN non trouvé dans les variables d\'environnement');
}

function initialize(mainWindow) {
    // Vérifier les mises à jour au démarrage
    autoUpdater.checkForUpdates();

    // Vérifier les mises à jour toutes les 2 heures
    setInterval(() => {
        autoUpdater.checkForUpdates();
    }, 2 * 60 * 60 * 1000);

    // Événements de mise à jour
    autoUpdater.on('checking-for-update', () => {
        mainWindow.webContents.send('update-status', 'Ka vérifié si nana nouvo vèrsion...');
    });

    autoUpdater.on('update-available', (info) => {
        mainWindow.webContents.send('update-available', {
            version: info.version,
            releaseNotes: info.releaseNotes
        });
    });

    autoUpdater.on('update-not-available', () => {
        mainWindow.webContents.send('update-not-available');
    });

    autoUpdater.on('error', (err) => {
        mainWindow.webContents.send('update-error', err.message);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        mainWindow.webContents.send('update-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update-downloaded');
    });

    // Gérer les demandes de l'interface utilisateur
    ipcMain.handle('start-update', () => {
        autoUpdater.downloadUpdate();
    });

    ipcMain.handle('install-update', () => {
        autoUpdater.quitAndInstall(false, true);
    });

    ipcMain.handle('check-for-updates', () => {
        autoUpdater.checkForUpdates();
    });
}

module.exports = {
    initialize
};