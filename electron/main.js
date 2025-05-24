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
    frame: false,
    autoHideMenuBar: true,
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

// Ajouter la gestion des commandes de fenêtre
ipcMain.handle('window-control', (event, command) => {
  switch (command) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      mainWindow.close();
      break;
    case 'reload':
      mainWindow.reload();
      break;
    case 'toggle-devtools':
      mainWindow.webContents.toggleDevTools();
      break;
    case 'about':
      // Créer une fenêtre À propos
      const aboutWindow = new BrowserWindow({
        width: 300,
        height: 200,
        parent: mainWindow,
        modal: true,
        show: false,
        frame: false,
        resizable: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      aboutWindow.loadURL(`data:text/html;charset=utf-8,
        <html>
          <head>
            <style>
              body {
                font-family: system-ui;
                margin: 0;
                padding: 20px;
                background: #1F2937;
                color: white;
                user-select: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
              }
              h2 { margin: 0 0 10px 0; }
              p { margin: 5px 0; color: #9CA3AF; }
              button {
                margin-top: 20px;
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                background: #374151;
                color: white;
                cursor: pointer;
              }
              button:hover { background: #4B5563; }
            </style>
          </head>
          <body>
            <h2>Ti'Bot</h2>
            <p>Version 1.0.3</p>
            <p>© 2024 Ti'Bot Réunion</p>
            <button onclick="window.close()">Fermer</button>
          </body>
        </html>
      `);

      aboutWindow.once('ready-to-show', () => {
        aboutWindow.show();
      });
      break;
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});