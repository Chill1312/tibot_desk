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

// Variable pour suivre l'état du serveur
let isServerAvailable = false;
let lastServerCheck = 0;
const SERVER_CHECK_INTERVAL = 5000; // 5 secondes entre les vérifications

class CodeService {
    constructor() {
        log.info('Initialisation du service Code avec serveur API intermédiaire...');
        
        try {
            // Initialiser les écouteurs IPC
            this.initializeIpcListeners();
            
            // Vérifier la disponibilité du serveur au démarrage
            this.checkServerAvailability();
            
            log.info('Service Code initialisé avec succès !');
        } catch (error) {
            log.error('Erreur lors de l\'initialisation du service Code:', error);
            this.initError = error.message;
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
        ipcMain.handle('code:generate', async (event, { prompt, language, level }) => {
            log.info('=== Nouvelle requête de génération de code ===');
            log.info(`Prompt: "${prompt}"`);
            log.info(`Langage: ${language}, Niveau: ${level}`);
            
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
                log.info('Génération du code via le serveur API intermédiaire...');
                const response = await this.generateCode(prompt, language, level);
                log.info('Code généré avec succès');
                return { success: true, data: response };
            } catch (error) {
                log.error('Erreur lors de la génération du code:', error);
                
                // Analyser l'erreur pour fournir un message plus précis
                let errorMessage = error.message || 'Erreur inconnue';
                let errorType = 'unknown_error';
                let serverUnavailable = false;
                
                // Détecter les types d'erreurs courants
                if (errorMessage.includes('API key') || errorMessage.includes('authentification')) {
                    errorType = 'api_key_error';
                } else if (errorMessage.includes('network') || errorMessage.includes('connexion') || errorMessage.includes('timeout') || 
                           errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ETIMEDOUT')) {
                    errorType = 'network_error';
                    serverUnavailable = true;
                    errorMessage = 'Le serveur API Ti\'Bot n\'est pas disponible. Assurez-vous que le serveur est démarré sur localhost:3000.';
                } else if (errorMessage.includes('surchargé') || errorMessage.includes('429')) {
                    errorType = 'rate_limit_error';
                }
                
                return { 
                    success: false, 
                    error: errorMessage,
                    errorType: errorType,
                    serverUnavailable
                };
            }
        });
    }

    async generateCode(prompt, language, level) {
        try {
            log.info('Appel au serveur API intermédiaire...');
            
            // Appeler l'API intermédiaire
            const response = await axios.post(
                `${API_SERVER_URL}/code/generate`,
                { prompt, language, level },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY
                    },
                    timeout: 30000 // Timeout de 30 secondes
                }
            );
            
            // Vérifier si la réponse est valide
            if (response.data && response.data.success) {
                log.info('Réponse reçue du serveur API intermédiaire');
                return {
                    code: response.data.response,
                    language: response.data.language
                };
            } else {
                throw new Error(response.data.message || 'Erreur lors de la génération du code');
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
                log.error('Erreur de configuration de la requête:', error.message);
                throw error;
            }
        }
    }
}

// Exporter une instance unique du service
module.exports = new CodeService();
