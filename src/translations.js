export const translations = {
  creole: {
    // Général
    welcome: "Bonzour! Moin lé Ti'Bot, out premier assistant IA kréol! Mi pé aid aou an kréol ou an fransé. Kosa ou i vé fer zordi?",
    subtitle: "IA Kréol La Rénion",
    footer: "Ti'Bot - Premié IA kréol La Rénion",
    recommended: "Rekomandé",
    enterToSend: "Apiy si Enter pou anvoy out messaz",

    // Navigation
    settings: 'Paramèt',
    modes: 'Bann Mod',
    chat: 'Kozé',
    image: 'Zimaz',
    code: 'Kod',
    history: 'Listwar Kozman',
    noHistory: 'Listwar i lé vid',

    // Modèles IA
    models: {
      base: {
        name: "Ti'Bot Base",
        desc: "Rapid & éfikas"
      },
      pro: {
        name: "Ti'Bot Pro",
        desc: "Pli kapab, pli prési"
      },
      creative: {
        name: "Ti'Bot Kréatif",
        desc: "Po bann kréasion artis"
      }
    },

    // Headers
    chatHeader: "Kozé ek Ti'Bot",
    imageHeader: "Kréasion Zimaz",
    codeHeader: "Zénèr Kod",
    
    // Chat interface
    messagePlaceholder: "Tap out messaz isi... (kréol ou fransé)",
    sendMessage: "Anvoy",
    typingIndicator: "Ka réfléshi...",
    newChat: "Nouvo Kozé",
    newImage: "Nouvo Zimaz",
    
    // Image generation
    imageDescription: "Dekri kosa ou i vé vwar, Ti'Bot i kré pou ou!",
    imagePromptTitle: "Dekri out zimaz",
    imagePrompt: "Ex: In pti kaz kréol ek varang blé, soleil koushan dèryèr piton d'la fournèz...",
    generateImage: "Kré zimaz",
    generating: "Ka kré...",
    imageStyles: {
      realistic: "Réalis",
      artistic: "Artis",
      tropical: "Tropikal",
      fantasy: "Fantézi"
    },
    imageStylesDesc: {
      realistic: "Zimaz réalis, parey foto",
      artistic: "Zimaz artistik, pli kréatif",
      tropical: "Lanbyans tropikal La Rénion",
      fantasy: "Zimaz imazinèr, fantastik"
    },
    
    // Code generation
    codeDescription: "Explik kosa ou i vé, Ti'Bot i ékri le kod pou ou!",
    codePromptTitle: "Kosa ou i vé kod?",
    codeExamplesTitle: "Bann légzanp:",
    codeExamples: {
      python: "Kod Python",
      javascript: "Kod JavaScript",
      html: "Kod HTML"
    },
    codeExamplePrompt: "Fé in {{example}} an {{language}}",
    codePlaceholder: "Ex: Fé in fonksion pou kalkil si in dat lé in zour férié La Rénion...",
    generateCode: "Zénèr kod",
    codeLevel: "Nivo",
    codeLevels: {
      beginner: "Débian",
      advanced: "Avansé"
    },
    
    // Settings
    appearance: {
      title: "Tèm ek Aparans",
      systemTheme: "Swiv tèm Windows",
      systemThemeDesc: "Ti'Bot i adapte son tèm selon out réglaz Windows",
      darkMode: "Mod fénwar",
      darkModeDesc: "Baskil ant mod fénwar (normal) ek mod klèr"
    },
    language: {
      title: "Lang & Réjion",
      preferred: "Lang préféré",
      creoleOnly: "Kréol rényoné",
      frenchOnly: "Fransé",
      tip: "Swazi out lang préféré pou Ti'Bot"
    },
    privacy: {
      title: "Konfidansyalité",
      autoSave: "Sovgard otomatik",
      autoSaveDesc: "Sovgard out bann kozman otomatikman",
      notifications: "Bann notifikasyon",
      notificationsDesc: "Aktiv bann notifikasyon Ti'Bot",
      deleteData: "Siprim tout bann doné"
    },

    // Help section
    help: {
      title: "Bann zèd",
      version: "Vèrsion",
      logout: "Dékonèkt"
    },

    // Buttons
    buttons: {
      cancel: "Anilé",
      save: "Sovgard Paramèt",
      saved: "Paramèt sovgardé!"
    },

    // Empty states
    empty: {
      images: "Pa ankor gen zimaz",
      imagesDesc: "Ekri kosa ou anvi vwar, Ti'Bot i kré pou ou!",
      code: "Paré pou kod?",
      codeDesc: "Explik kosa ou i vé, Ti'Bot i okip tout!"
    },

    // Section titles
    sections: {
      imageCreation: "Kréasion Zimaz",
      codeGenerator: "Zénèr Kod"
    },

    // Chat
    inputPlaceholder: "Koz ek mwin an kréol ou fransé...",
    
    // Code examples and descriptions
    codeLanguages: {
      python: "Python",
      js: "JS",
      java: "Java",
      cpp: "C++"
    },
    codeInputPlaceholder: "Explik kosa ou i vé, Ti'Bot i okip tout!",
    readyToCode: {
      title: "Paré pou kod?",
      description: "Explik kosa ou i vé, Ti'Bot i okip tout!"
    },
    errors: {
      aiError: "Oups ! Na in ti problèm èk lo servèr IA. Essaye in ot foi sivouplé !",
      networkError: "Problèm connexion ! Vérifie out internet sivouplé.",
      unknownError: "Oups ! Na in problèm. Essaye in ot foi sivouplé !",
      imageGenerationFailed: "Problèm pou kré out zimaz !",
      serverUnavailable: "Lo servèr API Ti'Bot i lé pa disponib. Asir aou ke lo servèr lé démaré si localhost:3000."
    },
    
    // Image features
    downloadImage: "Télécharz zimaz",
    variation: "Varyasion",
    variations: "Fé dot varyasion",
    tryAgain: "Essaye ankor"
  },
  french: {
    // Général
    welcome: "Bonjour ! Je suis Ti'Bot, votre premier assistant IA créole ! Je peux vous aider en créole ou en français. Que souhaitez-vous faire aujourd'hui ?",
    subtitle: "IA Créole de La Réunion",
    footer: "Ti'Bot - Premier IA créole de La Réunion",
    recommended: "Recommandé",
    enterToSend: "Appuyez sur Entrée pour envoyer",

    // Navigation
    settings: 'Paramètres',
    modes: 'Modes',
    chat: 'Discussion',
    image: 'Images',
    code: 'Code',
    history: 'Historique',
    noHistory: 'Aucun historique disponible',

    // Modèles IA
    models: {
      base: {
        name: "Ti'Bot Base",
        desc: "Rapide & efficace"
      },
      pro: {
        name: "Ti'Bot Pro",
        desc: "Plus capable, plus précis"
      },
      creative: {
        name: "Ti'Bot Créatif",
        desc: "Pour les créations artistiques"
      }
    },

    // Headers
    chatHeader: "Discussion avec Ti'Bot",
    imageHeader: "Création d'images",
    codeHeader: "Générateur de code",
    
    // Chat interface
    messagePlaceholder: "Tapez votre message ici... (créole ou français)",
    sendMessage: "Envoyer",
    typingIndicator: "En train de réfléchir...",
    newChat: "Nouvelle Discussion",
    newImage: "Nouvelle Image",
    
    // Image generation
    imageDescription: "Décrivez ce que vous voulez voir, Ti'Bot le crée pour vous !",
    imagePromptTitle: "Décrivez votre image",
    imagePrompt: "Ex: Une case créole avec une varangue bleue, coucher de soleil derrière le piton de la fournaise...",
    generateImage: "Créer l'image",
    generating: "Génération en cours...",
    imageStyles: {
      realistic: "Réaliste",
      artistic: "Artistique",
      tropical: "Tropical",
      fantasy: "Fantaisie"
    },
    imageStylesDesc: {
      realistic: "Image réaliste, comme une photo",
      artistic: "Image artistique, plus créative",
      tropical: "Ambiance tropicale de La Réunion",
      fantasy: "Image imaginaire, fantastique"
    },
    
    // Code generation
    codeDescription: "Expliquez ce que vous voulez, Ti'Bot écrit le code pour vous !",
    codePromptTitle: "Que voulez-vous coder ?",
    codeExamplesTitle: "Exemples :",
    codeExamples: {
      python: "Code Python",
      javascript: "Code JavaScript",
      html: "Code HTML"
    },
    codeExamplePrompt: "Faire un {{example}} en {{language}}",
    codePlaceholder: "Ex: Faire une fonction pour calculer si une date est un jour férié à La Réunion...",
    generateCode: "Générer le code",
    codeLevel: "Niveau",
    codeLevels: {
      beginner: "Débutant",
      advanced: "Avancé"
    },
    
    // Settings
    appearance: {
      title: "Thème et Apparence",
      systemTheme: "Suivre le thème Windows",
      systemThemeDesc: "Ti'Bot s'adapte au thème de votre système",
      darkMode: "Mode sombre",
      darkModeDesc: "Basculer entre mode sombre (par défaut) et mode clair"
    },
    language: {
      title: "Langue & Région",
      preferred: "Langue préférée",
      creoleOnly: "Créole réunionnais",
      frenchOnly: "Français",
      tip: "Choisissez votre langue préférée pour Ti'Bot"
    },
    privacy: {
      title: "Confidentialité",
      autoSave: "Sauvegarde automatique",
      autoSaveDesc: "Sauvegarder automatiquement vos conversations",
      notifications: "Notifications",
      notificationsDesc: "Activer les notifications de Ti'Bot",
      deleteData: "Supprimer toutes les données"
    },

    // Help section
    help: {
      title: "Aide",
      version: "Version",
      logout: "Déconnexion"
    },

    // Buttons
    buttons: {
      cancel: "Annuler",
      save: "Sauvegarder les paramètres",
      saved: "Paramètres sauvegardés !"
    },

    // Empty states
    empty: {
      images: "Pas encore d'images",
      imagesDesc: "Décrivez ce que vous voulez voir, Ti'Bot le crée pour vous !",
      code: "Prêt à coder ?",
      codeDesc: "Expliquez ce que vous voulez, Ti'Bot s'occupe de tout !"
    },

    // Section titles
    sections: {
      imageCreation: "Création d'images",
      codeGenerator: "Générateur de code"
    },

    // Chat
    newChat: "Nouvelle discussion",
    inputPlaceholder: "Posez votre question en créole ou en français...",
    
    // Code examples and descriptions
    codeLanguages: {
      python: "Python",
      js: "JS",
      java: "Java",
      cpp: "C++"
    },
    codeInputPlaceholder: "Expliquez ce que vous voulez, Ti'Bot s'occupe de tout !",
    readyToCode: {
      title: "Prêt à coder ?",
      description: "Expliquez ce que vous voulez, Ti'Bot s'occupe de tout !"
    },
    errors: {
      aiError: "Oups ! Il y a eu un problème avec le serveur IA. Veuillez réessayer !",
      networkError: "Problème de connexion ! Vérifiez votre connexion internet.",
      unknownError: "Oups ! Une erreur est survenue. Veuillez réessayer !",
      imageGenerationFailed: "Problème lors de la génération de l'image !",
      serverUnavailable: "Le serveur API Ti'Bot n'est pas disponible. Assurez-vous que le serveur est démarré sur localhost:3000."
    },
    
    // Image features
    downloadImage: "Télécharger l'image",
    variation: "Variation",
    variations: "Créer des variations",
    tryAgain: "Réessayer"
  }
}; 