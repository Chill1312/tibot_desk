// Chargement des variables d'environnement
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const log = require('electron-log');

// Configuration des logs
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';

// Importer les clés API par défaut
const defaultKeys = require('./config/default-keys');

// Fonction pour configurer les clés API
function setupApiKeys() {
  // Essayer de charger depuis le fichier .env
  let envLoaded = false;
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    log.info('Fichier .env trouvé, chargement des variables d\'environnement...');
    const result = dotenv.config({ path: envPath });
    
    if (!result.error) {
      envLoaded = true;
      log.info('Variables d\'environnement chargées avec succès');
    } else {
      log.error('Erreur lors du chargement du fichier .env:', result.error);
    }
  } else {
    // Essayer de charger depuis le répertoire parent (utile pour les versions packagées)
    const parentEnvPath = path.resolve(process.cwd(), '..', '.env');
    
    if (fs.existsSync(parentEnvPath)) {
      log.info('Fichier .env trouvé dans le répertoire parent, chargement...');
      const result = dotenv.config({ path: parentEnvPath });
      
      if (!result.error) {
        envLoaded = true;
        log.info('Variables d\'environnement chargées avec succès depuis le répertoire parent');
      } else {
        log.error('Erreur lors du chargement du fichier .env parent:', result.error);
      }
    }
  }
  
  // Si aucun fichier .env n'a été trouvé ou si les clés ne sont pas définies, utiliser les clés par défaut
  if (!process.env.MISTRAL_API_KEY) {
    log.info('Clé API Mistral non trouvée dans les variables d\'environnement, utilisation de la clé par défaut');
    process.env.MISTRAL_API_KEY = defaultKeys.MISTRAL_API_KEY;
  }
  
  if (!process.env.STABLE_DIFFUSION_API_KEY) {
    log.info('Clé API Stable Diffusion non trouvée dans les variables d\'environnement, utilisation de la clé par défaut');
    process.env.STABLE_DIFFUSION_API_KEY = defaultKeys.STABLE_DIFFUSION_API_KEY;
  }
  
  // Vérifier que les clés sont disponibles
  log.info('Clé API Mistral disponible:', !!process.env.MISTRAL_API_KEY);
  log.info('Clé API Stable Diffusion disponible:', !!process.env.STABLE_DIFFUSION_API_KEY);
}

// Configurer les clés API
setupApiKeys();

const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const isDev = !app.isPackaged;
const { getIconPath } = require('./icons');
const { initialize: initializeUpdater } = require('./updater');

// Initialiser les services après le chargement des variables d'environnement
const mistralService = require('./services/mistralService');
const stableDiffusionService = require('./services/stableDiffusionService');
const codeService = require('./services/codeService');

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