const { contextBridge, ipcRenderer } = require('electron');

// Exposer process.env de manière sécurisée
contextBridge.exposeInMainWorld('process', {
  env: {
    HUGGING_FACE_TOKEN: process.env.HUGGING_FACE_TOKEN,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    STABLE_DIFFUSION_API_KEY: process.env.STABLE_DIFFUSION_API_KEY
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
      'code:generate',
      'mistral:chat',
      'stableDiffusion:generateImage',
      'window-control'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },

  // Ajouter les fonctions Mistral
  mistral: {
    chat: (message, language) => ipcRenderer.invoke('mistral:chat', { message, language })
  },
  
  // Ajouter les fonctions Stable Diffusion
  stableDiffusion: {
    generateImage(prompt, style) {
      return ipcRenderer.invoke('stableDiffusion:generateImage', { prompt, style });
    }
  },
  
  // Ajouter les fonctions Code
  code: {
    generate(prompt, language, level) {
      return ipcRenderer.invoke('code:generate', { prompt, language, level });
    }
  }
});