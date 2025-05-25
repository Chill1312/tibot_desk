// Serveur API intégré pour Ti'Bot
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const log = require('electron-log');

// Configuration des logs
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';

// Fonction pour démarrer le serveur API intégré
function startApiServer() {
    const app = express();
    const PORT = 3000;

    // Middleware de base
    app.use(helmet()); // Sécurité
    app.use(cors()); // Autoriser les requêtes cross-origin
    app.use(express.json()); // Parser le JSON
    app.use(morgan('dev')); // Logging

    // Clé API pour accéder au serveur intermédiaire
    const API_KEY_SECRET = process.env.API_KEY_SECRET || 'tibot_secret_key_change_this_in_production';

    // Middleware pour valider la clé API
    const validateApiKey = (req, res, next) => {
        const apiKey = req.headers['x-api-key'];
        
        if (!apiKey || apiKey !== API_KEY_SECRET) {
            return res.status(401).json({
                success: false,
                message: "Accès non autorisé. Clé API invalide."
            });
        }
        
        next();
    };

    // Routes de base
    app.get('/', (req, res) => {
        res.json({ 
            message: "Bienvenue sur l'API Ti'Bot intégrée",
            version: "1.2.0",
            status: "online"
        });
    });

    // Route pour Mistral
    app.post('/api/mistral/chat', validateApiKey, async (req, res) => {
        try {
            // Vérifier que la requête contient un message
            const { message, language, systemPrompt } = req.body;
            
            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: "Le message est requis"
                });
            }
            
            // Préparer les messages pour l'API Mistral
            // Utiliser le systemPrompt personnalisé s'il est fourni, sinon utiliser le prompt par défaut
            let defaultSystemPrompt = language === 'creole' 
                ? "Ou lé in assistant IA ki apèl Ti'Bot. Ou i koné bien la kultur rényonèz. Ou i répon an kréol rényoné. Ou i done bann répons bien strukturé avek bann tit, sou-tit, listes, é émoji. Ou i done bann répons an kréol rényoné, pa an fransé. Ou i pe kozé sir tout bann sizé, mé ou i done pa bann répons ofansan, rasist, ou séksis. Ou i done pa non pli bann répons ki pe fé di mal domoun. Ou i striktir out répons konm sa: 1) In tit avek émoji, 2) In sou-tit si nésésèr, 3) Bann paragraf avek émoji apropié, 4) Bann list avek pwin ou nimeró, 5) In konklizion. Ou i itiliz bann émoji pou rann out répons pli vivan é pli intérésan."
                : "Tu es un assistant IA appelé Ti'Bot. Tu connais bien la culture réunionnaise. Tu réponds en français avec des réponses bien structurées incluant des titres, sous-titres, listes et émojis appropriés. Tes réponses doivent être informatives, précises et agréables à lire. Tu peux parler de tous les sujets, mais tu ne donnes pas de réponses offensantes, racistes ou sexistes. Tu ne donnes pas non plus de réponses qui pourraient nuire aux personnes. Structure tes réponses ainsi: 1) Un titre accrocheur avec émoji, 2) Un sous-titre si nécessaire, 3) Des paragraphes avec émojis pertinents, 4) Des listes à puces ou numérotées quand c'est approprié, 5) Une conclusion. Utilise des émojis pour rendre tes réponses plus vivantes et engageantes.";
            
            // Log des informations de personnalisation
            if (systemPrompt) {
                log.info('Utilisation d\'un prompt système personnalisé');
            }
            
            const messages = [
                {
                    role: "system",
                    content: systemPrompt || defaultSystemPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ];
            
            log.info(`Nouvelle requête Mistral: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
            
            // Vérifier que la clé API Mistral est disponible
            const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
            if (!MISTRAL_API_KEY) {
                return res.status(500).json({
                    success: false,
                    message: "Clé API Mistral non configurée sur le serveur."
                });
            }
            
            // Appeler l'API Mistral
            const response = await axios.post(
                'https://api.mistral.ai/v1/chat/completions',
                {
                    model: "mistral-medium",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${MISTRAL_API_KEY}`
                    }
                }
            );
            
            // Extraire la réponse
            const aiResponse = response.data.choices[0].message.content;
            
            // Renvoyer la réponse
            return res.json({
                success: true,
                response: aiResponse
            });
            
        } catch (error) {
            log.error('Erreur lors de l\'appel à l\'API Mistral:', error);
            
            // Préparer un message d'erreur convivial
            let errorMessage = "Désolé, Ti'Bot ne peut pas répondre pour le moment. Veuillez réessayer plus tard.";
            
            // Vérifier le type d'erreur pour un message plus précis
            if (error.response) {
                const status = error.response.status;
                
                if (status === 401) {
                    errorMessage = "Problème d'authentification avec le service IA.";
                } else if (status === 429) {
                    errorMessage = "Le service IA est temporairement surchargé. Veuillez réessayer dans quelques minutes.";
                } else if (status >= 500) {
                    errorMessage = "Le service IA rencontre des difficultés techniques. Veuillez réessayer plus tard.";
                }
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                errorMessage = "Impossible de se connecter au service IA. Vérifiez votre connexion internet.";
            }
            
            return res.status(500).json({
                success: false,
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // Route pour Stability AI (génération d'images)
    app.post('/api/stability/generate', validateApiKey, async (req, res) => {
        try {
            const { prompt, style } = req.body;
            
            if (!prompt) {
                return res.status(400).json({
                    success: false,
                    message: "Le prompt est requis"
                });
            }
            
            // Vérifier que la clé API Stability est disponible
            const STABILITY_API_KEY = process.env.STABLE_DIFFUSION_API_KEY;
            if (!STABILITY_API_KEY) {
                return res.status(500).json({
                    success: false,
                    message: "Clé API Stability non configurée sur le serveur."
                });
            }
            
            // Déterminer le style à utiliser
            const engineId = "stable-diffusion-xl-1024-v1-0";
            let stylePreset = style || "photographic";
            
            // Appeler l'API Stability
            const response = await axios({
                method: 'post',
                url: `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${STABILITY_API_KEY}`
                },
                data: {
                    text_prompts: [
                        {
                            text: prompt,
                            weight: 1
                        }
                    ],
                    cfg_scale: 7,
                    height: 1024,
                    width: 1024,
                    samples: 1,
                    steps: 30,
                    style_preset: stylePreset
                }
            });
            
            // Extraire les images générées
            const images = response.data.artifacts.map(artifact => {
                return {
                    base64: artifact.base64,
                    seed: artifact.seed,
                    finishReason: artifact.finish_reason
                };
            });
            
            // Renvoyer les images
            return res.json({
                success: true,
                images: images
            });
            
        } catch (error) {
            log.error('Erreur lors de l\'appel à l\'API Stability:', error);
            
            // Préparer un message d'erreur convivial
            let errorMessage = "Désolé, Ti'Bot ne peut pas générer d'images pour le moment. Veuillez réessayer plus tard.";
            
            // Vérifier le type d'erreur pour un message plus précis
            if (error.response) {
                const status = error.response.status;
                
                if (status === 401) {
                    errorMessage = "Problème d'authentification avec le service de génération d'images.";
                } else if (status === 429) {
                    errorMessage = "Le service de génération d'images est temporairement surchargé. Veuillez réessayer dans quelques minutes.";
                } else if (status >= 500) {
                    errorMessage = "Le service de génération d'images rencontre des difficultés techniques. Veuillez réessayer plus tard.";
                }
            }
            
            return res.status(500).json({
                success: false,
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // Route pour le service de code
    app.post('/api/code/generate', validateApiKey, async (req, res) => {
        try {
            const { prompt, language, level } = req.body;
            
            if (!prompt) {
                return res.status(400).json({
                    success: false,
                    message: "Le prompt est requis"
                });
            }
            
            // Vérifier que la clé API Mistral est disponible (on utilise Mistral pour le code aussi)
            const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
            if (!MISTRAL_API_KEY) {
                return res.status(500).json({
                    success: false,
                    message: "Clé API Mistral non configurée sur le serveur."
                });
            }
            
            // Préparer le prompt pour la génération de code
            const codeLevel = level || "intermediate";
            let systemPrompt = `Tu es un expert en programmation ${language}. L'utilisateur te demande de générer du code. Réponds uniquement avec le code demandé, sans explications supplémentaires, sans markdown. Le niveau de compétence de l'utilisateur est "${codeLevel}". Génère du code propre, bien commenté et suivant les bonnes pratiques.`;
            
            // Appeler l'API Mistral pour la génération de code
            const response = await axios.post(
                'https://api.mistral.ai/v1/chat/completions',
                {
                    model: "mistral-medium",
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${MISTRAL_API_KEY}`
                    }
                }
            );
            
            // Extraire la réponse
            const codeResponse = response.data.choices[0].message.content;
            
            // Nettoyer la réponse (supprimer les balises de code markdown si présentes)
            let cleanCode = codeResponse;
            if (cleanCode.startsWith("```") && cleanCode.endsWith("```")) {
                // Supprimer la première ligne et la dernière ligne
                const lines = cleanCode.split('\n');
                cleanCode = lines.slice(1, lines.length - 1).join('\n');
                
                // Supprimer le nom du langage s'il est présent sur la première ligne
                if (cleanCode.startsWith(language) || cleanCode.startsWith("javascript") || cleanCode.startsWith("python")) {
                    cleanCode = cleanCode.split('\n').slice(1).join('\n');
                }
            }
            
            // Renvoyer le code généré
            return res.json({
                success: true,
                code: cleanCode
            });
            
        } catch (error) {
            log.error('Erreur lors de la génération de code:', error);
            
            // Préparer un message d'erreur convivial
            let errorMessage = "Désolé, Ti'Bot ne peut pas générer de code pour le moment. Veuillez réessayer plus tard.";
            
            return res.status(500).json({
                success: false,
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // Gestion des erreurs
    app.use((err, req, res, next) => {
        log.error(err.stack);
        
        // Formater le message d'erreur de manière conviviale
        let errorMessage = "Une erreur s'est produite sur le serveur.";
        
        if (err.name === 'ValidationError') {
            errorMessage = err.message;
        } else if (err.name === 'UnauthorizedError') {
            errorMessage = "Accès non autorisé.";
        }
        
        res.status(err.status || 500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });

    // Démarrer le serveur
    const server = app.listen(PORT, () => {
        log.info(`Serveur Ti'Bot API intégré démarré sur le port ${PORT}`);
        log.info(`Mode: ${process.env.NODE_ENV || 'development'}`);
    });

    return server;
}

module.exports = { startApiServer };
