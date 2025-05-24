const { ipcMain } = require('electron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');

// Configuration des logs
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';

// URL du serveur API intermédiaire
const API_SERVER_URL = 'http://localhost:3000/api';

// Clé API pour accéder au serveur intermédiaire (doit correspondre à API_KEY_SECRET dans le serveur)
const API_KEY = 'tibot_secret_key_change_this_in_production';

// Variable pour suivre l'état du serveur
let isServerAvailable = false;
let lastServerCheck = 0;
const SERVER_CHECK_INTERVAL = 5000; // 5 secondes entre les vérifications

class StableDiffusionService {
    constructor() {
        log.info('Initialisation du service Stable Diffusion avec serveur API intermédiaire...');
        
        try {
            // Créer le dossier pour stocker les images générées
            this.imagesDir = path.join(app.getPath('userData'), 'generated-images');
            if (!fs.existsSync(this.imagesDir)) {
                fs.mkdirSync(this.imagesDir, { recursive: true });
            }
            
            // Initialiser les écouteurs IPC
            this.initializeIpcListeners();
            
            // Vérifier la disponibilité du serveur au démarrage
            this.checkServerAvailability();
            
            log.info('Service Stable Diffusion initialisé avec succès !');
        } catch (error) {
            log.error('Erreur lors de l\'initialisation du service Stable Diffusion:', error);
        }
    }
    
    // Méthode pour vérifier si le serveur API est disponible
    async checkServerAvailability() {
        const now = Date.now();
        
        // Ne pas vérifier trop fréquemment
        if (now - lastServerCheck < SERVER_CHECK_INTERVAL) {
            return isServerAvailable;
        }
        
        lastServerCheck = now;
        
        try {
            log.info('Vérification de la disponibilité du serveur API...');
            // Utiliser l'URL de l'API avec le point d'entrée racine
            const response = await axios.get(`http://localhost:3000/`, {
                timeout: 3000, // Timeout court pour ne pas bloquer l'application
                validateStatus: function (status) {
                    return status >= 200 && status < 500; // Accepter tous les statuts entre 200 et 499
                }
            });
            
            // Si le serveur répond avec n'importe quel code de statut, il est considéré comme disponible
            log.info(`Serveur API a répondu avec le statut: ${response.status}`);
            isServerAvailable = true;
            return true;
        } catch (error) {
            isServerAvailable = false;
            log.warn('Serveur API non disponible:', error.message);
            return false;
        }
    }

    initializeIpcListeners() {
        ipcMain.handle('stableDiffusion:generateImage', async (event, { prompt, style }) => {
            log.info('=== Nouvelle requête de génération d\'image ===');
            log.info('Prompt:', prompt);
            log.info('Style:', style);
            
            // Vérifier si le serveur est disponible avant d'envoyer la requête
            const serverAvailable = await this.checkServerAvailability();
            if (!serverAvailable) {
                log.error('Serveur API non disponible pour traiter la requête');
                return { 
                    success: false, 
                    error: 'Le serveur API Ti\'Bot n\'est pas disponible. Assurez-vous que le serveur est démarré sur localhost:3000.',
                    errorType: 'server_unavailable',
                    serverUnavailable: true
                };
            }
            
            try {
                log.info('Génération de l\'image via le serveur API intermédiaire...');
                const imageData = await this.generateImage(prompt, style);
                log.info('Image générée avec succès');
                return { success: true, data: imageData };
            } catch (error) {
                log.error('Erreur détaillée:', error);
                const errorMessage = error.message || 'Erreur inconnue';
                const errorDetails = error.details || 'Pas de détails disponibles';
                let errorType = 'unknown_error';
                let serverUnavailable = false;
                
                // Détecter les types d'erreurs courants
                if (errorMessage.includes('API key') || errorMessage.includes('authentification')) {
                    errorType = 'api_key_error';
                } else if (errorMessage.includes('network') || errorMessage.includes('connexion') || errorMessage.includes('timeout') || 
                           errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ETIMEDOUT') || errorMessage.includes('Pas de réponse du serveur')) {
                    errorType = 'network_error';
                    serverUnavailable = true;
                    const newErrorMessage = 'Le serveur API Ti\'Bot n\'est pas disponible. Assurez-vous que le serveur est démarré sur localhost:3000.';
                    log.error(`Message d'erreur modifié: ${newErrorMessage}`);
                    return { 
                        success: false, 
                        error: newErrorMessage,
                        errorType: errorType,
                        serverUnavailable: true
                    };
                } else if (errorMessage.includes('limite') || errorMessage.includes('429')) {
                    errorType = 'rate_limit_error';
                }
                
                log.error(`Message d'erreur: ${errorMessage}`);
                log.error(`Détails de l'erreur: ${errorDetails}`);
                return { 
                    success: false, 
                    error: errorMessage, 
                    details: errorDetails,
                    errorType: errorType,
                    serverUnavailable
                };
            }
        });
    }

    async generateImage(prompt, style) {
        try {
            log.info('=== Début de la génération d\'image ===');
            log.info(`Prompt: "${prompt}"`);
            log.info(`Style: ${style}`);
            
            // Appeler l'API intermédiaire
            const response = await axios.post(
                `${API_SERVER_URL}/stability/generate-image`,
                { prompt, style },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY
                    },
                    timeout: 30000 // Timeout de 30 secondes pour la génération d'images
                }
            );
            
            // Vérifier si la réponse est valide
            if (response.data && response.data.success) {
                log.info('Réponse reçue du serveur API intermédiaire');
                
                const images = [];
                
                // Traiter chaque image générée
                for (let i = 0; i < response.data.data.length; i++) {
                    const imageData = response.data.data[i];
                    const base64Image = imageData.base64.split(',')[1]; // Extraire la partie base64 après "data:image/png;base64,"
                    
                    // Générer un nom de fichier unique
                    const timestamp = Date.now();
                    const filename = `image_${timestamp}_${i}.png`;
                    const filepath = path.join(this.imagesDir, filename);
                    
                    // Sauvegarder l'image sur le disque
                    fs.writeFileSync(filepath, Buffer.from(base64Image, 'base64'));
                    
                    // Ajouter l'image à la liste des images générées
                    images.push({
                        id: imageData.id || `${timestamp}_${i}`,
                        path: filepath,
                        base64: imageData.base64,
                        prompt: prompt,
                        style: style,
                        createdAt: imageData.createdAt || new Date().toISOString()
                    });
                }
                
                return images;
            } else {
                throw new Error(response.data.error || 'Erreur lors de la génération de l\'image');
            }
        } catch (error) {
            log.error('Erreur dans generateImage:', error);
            
            // Vérifier si l'erreur vient d'Axios
            if (error.response) {
                // L'API a répondu avec un code d'erreur
                log.error('Réponse d\'erreur de l\'API:', error.response.status);
                log.error('Données d\'erreur:', JSON.stringify(error.response.data));
                
                // Construire un message d'erreur plus informatif
                const statusCode = error.response.status;
                const apiMessage = error.response.data?.error || 'Pas de message d\'erreur';
                if (error.response.status === 429) {
                    // Erreur spécifique : limite de requêtes atteinte
                    log.error('Limite de requêtes Stability AI atteinte');
                    throw new Error('La limite quotidienne de génération d\'images a été atteinte. Veuillez réessayer demain ou mettre à niveau votre compte Stability AI.');
                } else {
                    throw new Error(`Erreur API (${statusCode}): ${apiMessage}`);
                }
            } else if (error.request) {
                // La requête a été faite mais pas de réponse reçue
                log.error('Pas de réponse reçue du serveur');
                throw new Error('Le serveur API Ti\'Bot n\'est pas disponible. Assurez-vous que le serveur est démarré sur localhost:3000.');
            } else if (error.code === 'ECONNREFUSED') {
                // Erreur de connexion refusée
                log.error('Connexion refusée par le serveur');
                throw new Error('Le serveur API Ti\'Bot n\'est pas disponible. Assurez-vous que le serveur est démarré sur localhost:3000.');
            } else if (error.code === 'ETIMEDOUT') {
                // Erreur de timeout
                log.error('Timeout lors de la connexion au serveur');
                throw new Error('Le serveur API Ti\'Bot n\'est pas disponible. Assurez-vous que le serveur est démarré sur localhost:3000.');
            } else {
                // Erreur lors de la configuration de la requête
                log.error('Erreur de configuration:', error.message);
                throw error;
            }
        }
    }
}

// Exporter une instance unique du service
module.exports = new StableDiffusionService();
