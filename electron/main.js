require('dotenv').config();
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;
const fs = require('fs');
const { getIconPath } = require('./icons');
const { initialize: initializeUpdater } = require('./updater');
require('./services/mistralService'); // Initialiser le service Mistral

let mainWindow;

function createWindow() {
  const iconPath = getIconPath();
  console.log('Chemin de l\'icône:', iconPath);
  console.log('L\'icône existe:', fs.existsSync(iconPath));

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    icon: path.join(__dirname, '../assets/icon.ico'),
    title: "Ti'Bot"
  });

  if (isDev) {
    // Mode développement
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Mode production - IMPORTANT: Chemin correct
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Envoyer le thème système initial
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('system-theme-changed', nativeTheme.shouldUseDarkColors);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (!isDev) {
      initializeUpdater(mainWindow);
    }
  });

  // Log pour debug
  mainWindow.webContents.on('did-fail-load', () => {
    console.log('Failed to load');
    console.log('App path:', app.getAppPath());
    console.log('Looking for:', path.join(app.getAppPath(), 'dist', 'index.html'));
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Écouter les changements de thème système
nativeTheme.on('updated', () => {
  if (mainWindow) {
    mainWindow.webContents.send('system-theme-changed', nativeTheme.shouldUseDarkColors);
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});