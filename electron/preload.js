const { contextBridge, ipcRenderer } = require('electron');

// Exposer process.env de manière sécurisée
contextBridge.exposeInMainWorld('process', {
  env: {
    HUGGING_FACE_TOKEN: process.env.HUGGING_FACE_TOKEN,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY
  }
});

// Exposer une API sécurisée à window.electron
contextBridge.exposeInMainWorld('electron', {
  // Événements de mise à jour
  on: (channel, callback) => {
    const validChannels = [
      'system-theme-changed',
      'update-status',
      'update-available',
      'update-not-available',
      'update-error',
      'update-progress',
      'update-downloaded'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  
  // Retirer les écouteurs d'événements
  removeAllListeners: (channel) => {
    const validChannels = [
      'system-theme-changed',
      'update-status',
      'update-available',
      'update-not-available',
      'update-error',
      'update-progress',
      'update-downloaded'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },

  // Invoquer des commandes
  invoke: (channel, ...args) => {
    const validChannels = [
      'start-update',
      'install-update',
      'check-for-updates',
      'mistral:chat'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },

  // Ajouter les fonctions Mistral
  mistral: {
    chat: (message, language) => ipcRenderer.invoke('mistral:chat', { message, language })
  }
});