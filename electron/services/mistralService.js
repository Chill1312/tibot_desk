const { ipcMain, dialog } = require('electron');
const axios = require('axios');
const log = require('electron-log');

// Configuration des logs
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';

// URL du serveur API intermédiaire
// Par défaut, utiliser le serveur distant. Si celui-ci n'est pas disponible, essayer localhost
const DEFAULT_REMOTE_API_URL = 'https://tibot-api-server.onrender.com/api'; // URL du serveur déployé sur Render
const LOCAL_API_URL = 'http://localhost:3000/api';

// Utiliser le serveur distant par défaut
let API_SERVER_URL = DEFAULT_REMOTE_API_URL;

// Clé API pour accéder au serveur intermédiaire (doit correspondre à API_KEY_SECRET dans le serveur)
const API_KEY = 'tibot_secret_key_change_this_in_production';

// Variable pour suivre l'état du serveur
let isServerAvailable = false;
let lastServerCheck = 0;
const SERVER_CHECK_INTERVAL = 5000; // 5 secondes entre les vérifications

class MistralService {
    constructor() {
        log.info('Initialisation du service Mistral avec serveur API intermédiaire...');
        
        try {
            // Initialiser les écouteurs IPC
            this.initializeIpcListeners();
            
            // Vérifier la disponibilité du serveur au démarrage
            this.checkServerAvailability();
            
            log.info('Service Mistral initialisé avec succès !');
        } catch (error) {
            log.error('Erreur lors de l\'initialisation du service Mistral:', error);
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
        
        // Essayer d'abord le serveur distant
        try {
            log.info('Vérification de la disponibilité du serveur distant...');
            API_SERVER_URL = DEFAULT_REMOTE_API_URL;
            
            const response = await axios.get(DEFAULT_REMOTE_API_URL.replace('/api', ''), {
                timeout: 5000,
                headers: {
                    'x-api-key': API_KEY
                }
            });
            
            if (response.status === 200) {
                log.info('Serveur distant disponible!');
                isServerAvailable = true;
                return true;
            }
        } catch (error) {
            log.warn('Serveur distant non disponible:', error.message);
            
            // Essayer ensuite le serveur local
            try {
                log.info('Tentative de connexion au serveur local...');
                API_SERVER_URL = LOCAL_API_URL;
                
                const localResponse = await axios.get(LOCAL_API_URL.replace('/api', ''), {
                    timeout: 3000,
                    headers: {
                        'x-api-key': API_KEY
                    }
                });
                
                if (localResponse.status === 200) {
                    log.info('Serveur local disponible!');
                    isServerAvailable = true;
                    return true;
                }
            } catch (localError) {
                log.error('Serveur local non disponible:', localError.message);
                isServerAvailable = false;
                return false;
            }
        }
        
        // Si on arrive ici, aucun serveur n'est disponible
        isServerAvailable = false;
        return false;
    }

    initializeIpcListeners() {
        ipcMain.handle('mistral:chat', async (event, { message, language, personalization }) => {
            log.info('=== Nouvelle requête chat ===');
            log.info(`Message: "${message}"`);
            log.info(`Langue: ${language}`);
            
            // Vérifier si le serveur est disponible avant d'envoyer la requête
            const serverAvailable = await this.checkServerAvailability();
            if (!serverAvailable) {
                log.error('Serveur API non disponible pour traiter la requête');
                return { 
                    success: false, 
                    error: 'Ti\'Bot ne peut pas se connecter au serveur. Nous avons essayé le serveur distant et le serveur local, mais aucun n\'est disponible. Veuillez vérifier votre connexion internet.',
                    errorType: 'server_unavailable',
                    serverUnavailable: true
                };
            }
            
            try {
                log.info('Génération de la réponse via le serveur API intermédiaire...');
                log.info('Informations de personnalisation:', personalization);
                const response = await this.generateResponse(message, language, personalization);
                log.info('Réponse générée avec succès');
                return { success: true, data: response };
            } catch (error) {
                log.error('Erreur lors de la génération de la réponse:', error);
                
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
                    errorMessage = 'Ti\'Bot ne peut pas se connecter au serveur. Nous avons essayé le serveur distant et le serveur local, mais aucun n\'est disponible. Veuillez vérifier votre connexion internet.';
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

    async generateResponse(message, language, personalization) {
        try {
            log.info('Appel au serveur API intermédiaire...');
            log.info(`Message: "${message}", Langue: ${language}`);
            log.info(`URL: ${API_SERVER_URL}/mistral/chat`);
            log.info(`Clé API: ${API_KEY}`);
            
            // Préparer le contexte de personnalisation
            let systemPrompt = "Tu es Ti'Bot, un assistant IA spécialisé sur La Réunion, sa culture, son histoire et ses traditions. ";
            
            // Ajouter les informations de personnalisation au contexte si disponibles
            if (personalization) {
                systemPrompt += "Voici des informations importantes sur l'utilisateur:\n";
                
                if (personalization.name) {
                    systemPrompt += `- Nom/Prénom: ${personalization.name}\n`;
                }
                
                if (personalization.sector) {
                    const sectorMap = {
                        "nord": "Nord (Saint-Denis, Sainte-Marie, Sainte-Suzanne)",
                        "ouest": "Ouest (Saint-Paul, Le Port, La Possession, Saint-Leu)",
                        "est": "Est (Saint-André, Bras-Panon, Saint-Benoît)",
                        "sud": "Sud (Saint-Pierre, Saint-Louis, Le Tampon, Saint-Joseph)",
                        "hautsPlainesCirques": "Hauts, Plaines et Cirques (Cilaos, Salazie, Plaine des Palmistes)"
                    };
                    systemPrompt += `- Secteur de résidence: ${sectorMap[personalization.sector] || personalization.sector}\n`;
                }
                
                if (personalization.creoleLevel) {
                    const creoleLevelMap = {
                        "debutant": "Débutant - Comprend quelques mots",
                        "intermediaire": "Intermédiaire - Comprend mais parle peu",
                        "courant": "Courant - Parle et comprend bien",
                        "natif": "Natif - Parle créole couramment"
                    };
                    systemPrompt += `- Niveau de créole: ${creoleLevelMap[personalization.creoleLevel] || personalization.creoleLevel}\n`;
                }
                
                if (personalization.communicationStyle) {
                    const styleMap = {
                        "formel": "Formel et éducatif",
                        "conversationnel": "Conversationnel et amical",
                        "direct": "Direct et concis",
                        "creole": "Principalement en créole",
                        "mixte": "Mixte français/créole"
                    };
                    systemPrompt += `- Style de communication préféré: ${styleMap[personalization.communicationStyle] || personalization.communicationStyle}\n`;
                }
                
                if (personalization.interests && personalization.interests.length > 0) {
                    const interestMap = {
                        "culture": "Culture et traditions réunionnaises",
                        "cuisine": "Gastronomie créole",
                        "nature": "Nature et randonnées",
                        "histoire": "Histoire de La Réunion",
                        "musique": "Musique et danse (maloya, séga)",
                        "sport": "Sports et activités de plein air",
                        "technologie": "Technologie et innovation",
                        "education": "Éducation et formation",
                        "economie": "Économie et entrepreneuriat"
                    };
                    
                    systemPrompt += "- Centres d'intérêt: ";
                    systemPrompt += personalization.interests.map(interest => interestMap[interest] || interest).join(", ");
                    systemPrompt += "\n";
                }
                
                if (personalization.additionalInfo) {
                    systemPrompt += `- Informations supplémentaires: ${personalization.additionalInfo}\n`;
                }
                
                systemPrompt += "\nAdapte tes réponses en fonction de ces informations. ";
                
                // Ajuster le style de communication
                if (personalization.communicationStyle === "formel") {
                    systemPrompt += "Utilise un ton formel et éducatif. ";
                } else if (personalization.communicationStyle === "conversationnel") {
                    systemPrompt += "Sois amical et conversationnel. ";
                } else if (personalization.communicationStyle === "direct") {
                    systemPrompt += "Sois direct et concis. ";
                } else if (personalization.communicationStyle === "creole") {
                    systemPrompt += "Réponds principalement en créole réunionnais. ";
                } else if (personalization.communicationStyle === "mixte") {
                    systemPrompt += "Utilise un mélange de français et de créole réunionnais. ";
                }
                
                // Ajuster l'utilisation du créole en fonction du niveau
                if (personalization.creoleLevel === "debutant") {
                    systemPrompt += "Utilise très peu de créole, seulement des expressions simples avec traduction. ";
                } else if (personalization.creoleLevel === "intermediaire") {
                    systemPrompt += "Utilise du créole simple avec des traductions pour les expressions complexes. ";
                } else if (personalization.creoleLevel === "courant" || personalization.creoleLevel === "natif") {
                    systemPrompt += "Tu peux utiliser du créole plus complexe sans nécessairement traduire. ";
                }
                
                // Personnaliser l'adresse
                if (personalization.name) {
                    systemPrompt += `Adresse-toi à l'utilisateur par son nom: ${personalization.name}. `;
                }
            }
            
            log.info('System prompt généré:', systemPrompt);
            
            // Appeler l'API intermédiaire avec des options plus permissives
            const response = await axios.post(
                `${API_SERVER_URL}/mistral/chat`,
                { 
                    message, 
                    language,
                    systemPrompt
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY
                    },
                    timeout: 30000, // Timeout plus long (30 secondes)
                    maxRedirects: 5,
                    validateStatus: function (status) {
                        return status >= 200 && status < 500; // Accepter tous les statuts entre 200 et 499
                    }
                }
            );
            
            log.info(`Réponse reçue avec statut: ${response.status}`);
            log.info(`Données reçues:`, response.data);
            
            // Vérifier si la réponse est valide
            if (response.data && response.data.success) {
                log.info('Réponse reçue du serveur API intermédiaire');
                return response.data.response;
            } else {
                log.error('Réponse invalide du serveur:', response.data);
                throw new Error(response.data.message || 'Erreur lors de la génération de la réponse');
            }
        } catch (error) {
            log.error('Erreur lors de l\'appel au serveur API intermédiaire:', error);
            
            // Essayer de faire une requête simple pour vérifier si le serveur est disponible
            try {
                log.info('Tentative de vérification de la disponibilité du serveur...');
                await axios.get('http://localhost:3000/', { timeout: 3000 });
                log.info('Le serveur est disponible, mais la requête a échoué pour une autre raison');
                
                // Si nous arrivons ici, le serveur est disponible mais il y a un autre problème
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
                } else {
                    // Autre type d'erreur
                    throw new Error(`Erreur de communication avec le serveur: ${error.message}`);
                }
            } catch (checkError) {
                // Le serveur n'est pas disponible
                log.error('Le serveur n\'est pas disponible:', checkError.message);
                throw new Error('Le serveur API Ti\'Bot n\'est pas disponible. Assurez-vous que le serveur est démarré sur localhost:3000.');
            }
        }
    }
}

// Exporter une instance unique du service
module.exports = new MistralService();
