# Documentation pour les développeurs de Ti'Bot

Ce document est destiné aux développeurs qui travaillent sur Ti'Bot. Il explique comment configurer l'environnement de développement, comment intégrer les clés API pour les déploiements en production, et comment utiliser le serveur API intermédiaire pour sécuriser les clés API.

## Configuration des clés API pour le développement

Pour le développement, vous pouvez créer un fichier `.env` à la racine du projet avec les clés API suivantes :

```
MISTRAL_API_KEY=votre_clé_api_mistral
STABLE_DIFFUSION_API_KEY=votre_clé_api_stability_ai
```

## Configuration des clés API pour la production

Pour les déploiements en production, vous devez modifier le fichier `electron/config/default-keys.js` pour y intégrer vos clés API :

```javascript
module.exports = {
    MISTRAL_API_KEY: 'votre_clé_api_mistral_de_production',
    STABLE_DIFFUSION_API_KEY: 'votre_clé_api_stability_ai_de_production'
};
```

**Important** : Ne jamais committer les clés API de production dans le dépôt Git. Utilisez plutôt un processus de build qui injecte ces clés lors de la compilation.

## Serveur API intermédiaire

Pour améliorer la sécurité et éviter d'exposer les clés API directement dans l'application desktop, nous avons mis en place un serveur API intermédiaire qui sert de passerelle entre Ti'Bot et les services d'IA (Mistral et Stability AI).

### Avantages du serveur API intermédiaire

1. **Sécurité renforcée** : Les clés API restent sur le serveur et ne sont jamais exposées aux utilisateurs finaux.
2. **Contrôle d'accès** : Vous pouvez surveiller et limiter l'utilisation des API.
3. **Flexibilité** : Vous pouvez changer de fournisseur d'API sans avoir à mettre à jour l'application cliente.
4. **Maintenance simplifiée** : Les mises à jour des API peuvent être gérées côté serveur sans nécessiter de mise à jour de l'application.

### Configuration du serveur API

1. Clonez le dépôt du serveur API ou copiez les fichiers dans le dossier `tibot-api-server`.
2. Installez les dépendances :

```bash
cd tibot-api-server
npm install
```

3. Configurez les variables d'environnement en copiant le fichier `.env.example` en `.env` et en ajoutant vos clés API :

```bash
cp .env.example .env
```

4. Éditez le fichier `.env` avec vos clés API :

```
# Clés API
MISTRAL_API_KEY=votre_clé_api_mistral
STABLE_DIFFUSION_API_KEY=votre_clé_api_stability_ai

# Configuration du serveur
PORT=3000
NODE_ENV=production

# Sécurité
API_KEY_SECRET=votre_clé_secrète_pour_sécuriser_l_api
```

### Démarrage du serveur

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

### Configuration de Ti'Bot Desktop pour utiliser le serveur API

Dans les fichiers `electron/services/mistralService.js` et `electron/services/stableDiffusionService.js`, assurez-vous que les variables `API_SERVER_URL` et `API_KEY` correspondent à votre configuration :

```javascript
// URL du serveur API intermédiaire
const API_SERVER_URL = 'http://localhost:3000/api';

// Clé API pour accéder au serveur intermédiaire
const API_KEY = 'votre_clé_secrète_pour_sécuriser_l_api';
```

### Déploiement du serveur API en production

Pour un déploiement en production, nous recommandons :

1. Utiliser HTTPS pour sécuriser les communications
2. Configurer un proxy inverse comme Nginx
3. Utiliser PM2 pour gérer le processus Node.js
4. Mettre en place un système de surveillance et d'alertes

## Processus de build recommandé

1. Créez un fichier `default-keys.template.js` qui servira de modèle :

```javascript
module.exports = {
    MISTRAL_API_KEY: '{{MISTRAL_API_KEY}}',
    STABLE_DIFFUSION_API_KEY: '{{STABLE_DIFFUSION_API_KEY}}'
};
```

2. Lors du processus de build, utilisez un script qui remplace les placeholders par les vraies clés API :

```javascript
const fs = require('fs');
const path = require('path');

// Lire le template
const template = fs.readFileSync(path.join(__dirname, 'default-keys.template.js'), 'utf8');

// Remplacer les placeholders par les vraies clés
const content = template
    .replace('{{MISTRAL_API_KEY}}', process.env.MISTRAL_API_KEY)
    .replace('{{STABLE_DIFFUSION_API_KEY}}', process.env.STABLE_DIFFUSION_API_KEY);

// Écrire le fichier final
fs.writeFileSync(path.join(__dirname, 'default-keys.js'), content);
```

3. Exécutez ce script dans votre pipeline CI/CD en utilisant des variables d'environnement sécurisées.

## Gestion des erreurs

Ti'Bot est conçu pour être utilisé par des personnes non techniques. C'est pourquoi nous avons implémenté une gestion des erreurs qui traduit les erreurs techniques en messages conviviaux pour les utilisateurs.

Si vous ajoutez de nouvelles fonctionnalités, assurez-vous de suivre cette approche en :
1. Loggant les erreurs techniques pour le débogage
2. Affichant des messages d'erreur simples et compréhensibles pour les utilisateurs
3. Suggérant des actions correctives lorsque c'est possible

## Logs

Les logs sont essentiels pour le débogage. Nous utilisons `electron-log` pour enregistrer les logs dans des fichiers qui peuvent être consultés en cas de problème.

Les logs sont stockés dans :
- **Windows** : `%USERPROFILE%\AppData\Roaming\tibot-desktop\logs`
- **macOS** : `~/Library/Logs/tibot-desktop`
- **Linux** : `~/.config/tibot-desktop/logs`
