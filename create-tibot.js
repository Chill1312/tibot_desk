const fs = require('fs');
const path = require('path');

// Créer la structure des dossiers
const dirs = [
  'src',
  'electron',
  'assets'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Package.json
const packageJson = {
  "name": "tibot",
  "version": "1.0.0",
  "description": "Ti'Bot - Premier IA Kréol La Rénion",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron": "electron .",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "dist": "npm run build && electron-builder",
    "dist-win": "npm run build && electron-builder --win"
  },
  "build": {
    "appId": "com.reunion.tibot",
    "productName": "Ti'Bot",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "concurrently": "^8.2.2",
    "electron": "^30.0.1",
    "electron-builder": "^24.13.3",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.11",
    "wait-on": "^7.2.0"
  },
  "dependencies": {
    "lucide-react": "^0.378.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// index.html
const indexHtml = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ti'Bot - Premier IA Kréol La Rénion</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

fs.writeFileSync('index.html', indexHtml);

// vite.config.js
const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.ELECTRON=="true" ? './' : '/',
  build: {
    outDir: 'dist'
  }
})`;

fs.writeFileSync('vite.config.js', viteConfig);

// tailwind.config.js
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}`;

fs.writeFileSync('tailwind.config.js', tailwindConfig);

// postcss.config.js
const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

fs.writeFileSync('postcss.config.js', postcssConfig);

// src/main.jsx
const mainJsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

fs.writeFileSync('src/main.jsx', mainJsx);

// src/index.css
const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

fs.writeFileSync('src/index.css', indexCss);

// electron/main.js
const electronMain = `const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1F2937',
    show: false
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});`;

fs.writeFileSync('electron/main.js', electronMain);

console.log('✅ Structure du projet créée !');
console.log('');
console.log('Prochaines étapes :');
console.log('1. Copier le code de App.jsx depuis notre conversation');
console.log('2. npm install');
console.log('3. npm run dev');