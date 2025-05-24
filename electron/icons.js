const path = require('path');
const os = require('os');
const { app } = require('electron');

function getIconPath() {
    const platform = os.platform();
    // Utiliser app.getAppPath() pour obtenir le chemin correct en production
    const assetsPath = app.isPackaged 
        ? path.join(process.resourcesPath, 'assets')
        : path.join(__dirname, '../assets');

    console.log('Mode:', app.isPackaged ? 'Production' : 'Development');
    console.log('Assets path:', assetsPath);

    switch (platform) {
        case 'win32':
            return path.join(assetsPath, 'icon.ico');
        case 'darwin':
            return path.join(assetsPath, 'logo-256.png');
        default:
            return path.join(assetsPath, 'logo-256.png');
    }
}

module.exports = {
    getIconPath
}; 