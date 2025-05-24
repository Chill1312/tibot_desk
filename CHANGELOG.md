# Changelog

## [1.2.1] - 2025-05-25

### Améliorations
- Migration du serveur API vers Render pour une meilleure disponibilité
  - Accès au serveur API pour tous les utilisateurs sans configuration
  - Basculement automatique vers le serveur local si nécessaire
  - Messages d'erreur améliorés en cas d'indisponibilité du serveur
- Sécurisation des clés API sensibles sur le serveur distant

## [1.2.0] - 2025-05-24

### Nouvelles fonctionnalités
- Ajout d'un panneau de personnalisation pour Ti'Bot
  - Possibilité d'indiquer son nom pour une expérience personnalisée
  - Sélection du secteur de résidence à La Réunion (Nord, Sud, Est, Ouest, Hauts)
  - Choix du niveau de créole préféré (débutant à natif)
  - Sélection du style de communication (formel, conversationnel, direct, créole, mixte)
  - Définition des centres d'intérêt liés à La Réunion
  - Ajout d'informations supplémentaires personnalisées
- Adaptation des réponses de Ti'Bot en fonction des préférences utilisateur
- Intégration du serveur API directement dans l'application
  - Fonctionnement autonome sans nécessiter de serveur externe
  - Compatibilité avec tous les modes (discussion, image, code)
  - Installation simplifiée pour les utilisateurs

### Corrections
- Résolution du problème de communication avec le serveur API intermédiaire
  - Amélioration de la détection de disponibilité du serveur
  - Messages d'erreur plus clairs et informatifs pour l'utilisateur
  - Correction des problèmes d'encodage dans le fichier .env du serveur
- Correction du bug de l'effet de frappe (typing effect) qui s'appliquait à tous les messages
  - Les messages chargés depuis l'historique s'affichent maintenant immédiatement sans effet de frappe
  - Seuls les nouveaux messages envoyés par l'utilisateur et les nouvelles réponses du bot ont l'effet de frappe
- Amélioration de la navigation dans les conversations
  - Ajout du défilement automatique vers les nouveaux messages
  - Défilement automatique en temps réel pendant que Ti'Bot écrit sa réponse
  - Mémorisation de la position de défilement lors du changement de conversation
  - Restauration de la position précédente lors du rechargement d'une conversation

### Améliorations
- Meilleure gestion des erreurs de connexion au serveur API
- Logs plus détaillés pour faciliter le débogage
- Optimisation des performances lors du chargement des conversations
- Restauration de l'écran d'accueil (onboarding)
  - Affichage au premier lancement de l'application
  - Ajout d'une option "Ne plus afficher au démarrage"
  - Amélioration de l'interface utilisateur

## [1.0.5] - 2025-05-24

### Ajouts
- Serveur API intermédiaire pour sécuriser les clés API
- Génération d'images avec différents styles (réaliste, artistique, tropical, fantaisie)
- Historique des images générées avec sauvegarde dans localStorage

### Améliorations
- Meilleure gestion des erreurs avec messages conviviaux
- Support de plusieurs modèles Stable Diffusion pour plus de fiabilité
- Optimisation du chargement des variables d'environnement
- Logs détaillés pour faciliter le débogage
- Amélioration du formatage des réponses en mode discussion (titres, sous-titres, émojis)
- Utilisation du modèle Mistral Medium pour des réponses plus riches et structurées

### Corrections
- Résolution du problème de connexion au serveur IA en mode discussion
- Correction de la persistance de l'historique des images lors du changement de mode
- Résolution des problèmes avec l'API Stability AI
- Correction du bug d'affichage des messages précédents lors du changement de mode (effet de frappe)

## [1.0.4] - 2024-03-27

### Améliorations
- Amélioration du menu de prompts rapides :
  - Positionnement adaptatif (au-dessus/en-dessous selon le contexte)
  - Animations fluides pour l'ouverture et la fermeture
  - Meilleure intégration visuelle avec l'interface
  - Correction des problèmes d'affichage

## [1.0.3] - 2024-03-26

### Ajouts
- Ajout d'un menu de prompts rapides avec 4 options :
  - Conversation libre
  - Histoire de La Réunion
  - Culture locale
  - Expressions créoles
- Nouveau bouton avec icône ✨ dans la zone de saisie

### Améliorations
- Suppression de la barre de menu système Windows
- Création d'une barre de titre personnalisée
- Ajout des boutons de contrôle de fenêtre (minimiser, maximiser, fermer)
- Amélioration des espacements entre les messages
- Optimisation de l'interface utilisateur

## [1.0.2] - 2024-03-25

### Ajouts
- Support multilingue (français/créole réunionnais)
- Nouveau système de thèmes (clair/sombre/système)

### Améliorations
- Interface utilisateur modernisée
- Meilleure gestion des conversations
- Corrections de bugs mineurs

## [1.0.1] - 2024-03-24

### Ajouts
- Système de mise à jour automatique
- Historique des conversations
- Mode hors-ligne basique

### Améliorations
- Stabilité générale de l'application
- Performance des réponses
- Interface utilisateur plus réactive

## [1.0.0] - 2024-03-23

### Première version publique
- Interface de chat avec Ti'Bot
- Support du français et du créole réunionnais
- Génération de réponses via Mistral AI
- Design moderne et intuitif 