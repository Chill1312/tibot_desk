const { ipcMain } = require('electron');
const axios = require('axios');
const log = require('electron-log');

// Configuration des logs
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';

// URL du serveur API intermédiaire
const API_SERVER_URL = 'http://localhost:3000/api';

// Clé API pour accéder au serveur intermédiaire (doit correspondre à API_KEY_SECRET dans le serveur)
const API_KEY = 'tibot_secret_key_change_this_in_production';

class MistralService {
    constructor() {
        log.info('Initialisation du service Mistral avec serveur API intermédiaire...');
        
        try {
            // Initialiser les écouteurs IPC
            this.initializeIpcListeners();
            log.info('Service Mistral initialisé avec succès !');
        } catch (error) {
            log.error('Erreur lors de l\'initialisation du service Mistral:', error);
            this.initError = error.message;
        }
    }

    initializeIpcListeners() {
        ipcMain.handle('mistral:chat', async (event, { message, language }) => {
            log.info('=== Nouvelle requête chat ===');
            log.info(`Message: "${message}"`);
            log.info(`Langue: ${language}`);
            
            try {
                log.info('Génération de la réponse via le serveur API intermédiaire...');
                const response = await this.generateResponse(message, language);
                log.info('Réponse générée avec succès');
                return { success: true, data: response };
            } catch (error) {
                log.error('Erreur lors de la génération de la réponse:', error);
                
                // Analyser l'erreur pour fournir un message plus précis
                let errorMessage = error.message || 'Erreur inconnue';
                let errorType = 'unknown_error';
                
                // Détecter les types d'erreurs courants
                if (errorMessage.includes('API key') || errorMessage.includes('authentification')) {
                    errorType = 'api_key_error';
                } else if (errorMessage.includes('network') || errorMessage.includes('connexion') || errorMessage.includes('timeout')) {
                    errorType = 'network_error';
                } else if (errorMessage.includes('surchargé') || errorMessage.includes('429')) {
                    errorType = 'rate_limit_error';
                }
                
                return { 
                    success: false, 
                    error: errorMessage,
                    errorType: errorType
                };
            }
        });
    }

    async generateResponse(message, language) {
        try {
            log.info('Appel au serveur API intermédiaire...');
            
            // Appeler l'API intermédiaire
            const response = await axios.post(
                `${API_SERVER_URL}/mistral/chat`,
                { message, language },
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
                return response.data.response;
            } else {
                throw new Error(response.data.message || 'Erreur lors de la génération de la réponse');
            }
        } catch (error) {
            log.error('Erreur lors de l\'appel au serveur API intermédiaire:', error);
            
            // Vérifier si l'erreur vient d'Axios
            if (error.response) {
                // L'API a répondu avec un code d'erreur
                const status = error.response.status;
                const data = error.response.data;
                
                log.error(`Statut de l'erreur: ${status}`);
                log.error(`Données d'erreur:`, data);
                
                if (data && data.message) {
                    throw new Error(data.message);
                } else {
                    throw new Error(`Erreur du serveur (${status})`);
                }
            } else if (error.request) {
                // La requête a été faite mais pas de réponse reçue
                log.error('Pas de réponse reçue du serveur');
                throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
            } else {
                // Erreur lors de la configuration de la requête
                log.error('Erreur de configuration de la requête:', error.message);
                throw error;
            }
        }
    }
}

// Exporter une instance unique du service
module.exports = new MistralService();
