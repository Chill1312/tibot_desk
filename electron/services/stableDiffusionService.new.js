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
            log.info('Service Stable Diffusion initialisé avec succès !');
        } catch (error) {
            log.error('Erreur lors de l\'initialisation du service Stable Diffusion:', error);
        }
    }

    initializeIpcListeners() {
        ipcMain.handle('stableDiffusion:generateImage', async (event, { prompt, style }) => {
            log.info('=== Nouvelle requête de génération d\'image ===');
            log.info('Prompt:', prompt);
            log.info('Style:', style);
            
            try {
                log.info('Génération de l\'image via le serveur API intermédiaire...');
                const imageData = await this.generateImage(prompt, style);
                log.info('Image générée avec succès');
                return { success: true, data: imageData };
            } catch (error) {
                log.error('Erreur détaillée:', error);
                const errorMessage = error.message || 'Erreur inconnue';
                const errorDetails = error.details || 'Pas de détails disponibles';
                log.error(`Message d'erreur: ${errorMessage}`);
                log.error(`Détails de l'erreur: ${errorDetails}`);
                return { success: false, error: errorMessage, details: errorDetails };
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
                    }
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
                throw new Error(`Erreur API (${statusCode}): ${apiMessage}`);
            } else if (error.request) {
                // La requête a été faite mais pas de réponse reçue
                log.error('Pas de réponse reçue:', error.request);
                throw new Error('Pas de réponse du serveur. Vérifiez votre connexion internet.');
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
