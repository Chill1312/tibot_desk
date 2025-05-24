import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, Image, Code, Settings, Menu, X, Send, Sparkles, User, Bot, Home, History, Plus, Moon, Sun, Download, Copy, Palette, Wand2, RefreshCw, Check, Terminal, Globe, Cpu, Save, Bell, Database, Type, Shield, HelpCircle, LogOut, Trash2 } from 'lucide-react';
import logoImage from '../assets/logo.png';
import UpdateNotification from './components/UpdateNotification';
import TypingEffect from './components/TypingEffect';
import TitleBar from './components/TitleBar';
import { useTranslation } from 'react-i18next';
import './i18n';
import PromptMenu from './components/PromptMenu';

const TiBotInterface = () => {
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMode, setActiveMode] = useState('chat');
  const [darkMode, setDarkMode] = useState(true);
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState(i18n.language || 'french');
  const [messages, setMessages] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  
  // États pour l'historique des images
  const [imageHistory, setImageHistory] = useState([]);
  const [currentImageHistoryId, setCurrentImageHistoryId] = useState(null);
  
  // États pour le mode Code
  const [codePrompt, setCodePrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [codeLevel, setCodeLevel] = useState('beginner');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [welcomeTitle] = useState(() => {
    const titles = [
      "Bienvenue dans Ti'Bot ! Posez-moi une question en créole ou en français.",
      "Bonjour ! Je suis là pour vous aider à découvrir la culture réunionnaise.",
      "Oté ! Mi lé la pou kozé èk ou en kréol ou fransé.",
      "Découvrez la richesse de notre île avec Ti'Bot.",
      "Ensemble, préservons notre langue et notre culture."
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  });

  // Créer une nouvelle conversation
  const handleNewChat = () => {
    // Vérifier si une conversation vide existe déjà
    const emptyConversation = conversations.find(conv => !conv.messages || conv.messages.length === 0);
    
    if (emptyConversation) {
      // Si une conversation vide existe, on la sélectionne
      setCurrentConversationId(emptyConversation.id);
      setMessages([]);
      return;
    }

    // Si aucune conversation vide n'existe, on en crée une nouvelle
    const newConversation = {
      id: `conv-${Date.now()}`,
      title: 'Nouvelle conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ajouter la nouvelle conversation au début de la liste
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setCurrentConversationId(newConversation.id);
    setMessages([]);

    // Sauvegarder dans le localStorage
    localStorage.setItem('tibot-conversations', JSON.stringify(updatedConversations));
  };

  // Charger les conversations et l'historique des images au démarrage
  useEffect(() => {
    try {
      // Charger les conversations
      const savedConversations = localStorage.getItem('tibot-conversations');
      const loadedConversations = savedConversations ? JSON.parse(savedConversations) : [];
      setConversations(loadedConversations);
      
      // Créer une nouvelle conversation si aucune n'existe
      if (loadedConversations.length === 0) {
        handleNewChat();
      } else {
        // Vérifier si une conversation vide existe
        const emptyConversation = loadedConversations.find(conv => !conv.messages || conv.messages.length === 0);
        if (emptyConversation) {
          setCurrentConversationId(emptyConversation.id);
        } else {
          handleNewChat();
        }
      }
      
      // Charger l'historique des images
      const savedImageHistory = localStorage.getItem('tibot-image-history');
      const loadedImageHistory = savedImageHistory ? JSON.parse(savedImageHistory) : [];
      setImageHistory(loadedImageHistory);
      
      // Sélectionner la dernière génération d'images si elle existe
      if (loadedImageHistory.length > 0) {
        setCurrentImageHistoryId(loadedImageHistory[0].id);
      }

      // Vérifier si l'onboarding a été complété
      const onboardingCompleted = localStorage.getItem('tibot-onboarding-completed');
      setShowOnboarding(!onboardingCompleted);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      handleNewChat();
    }
  }, []);
  
  // Sauvegarder l'historique des images lorsqu'il change
  useEffect(() => {
    if (imageHistory && imageHistory.length > 0) {
      try {
        localStorage.setItem('tibot-image-history', JSON.stringify(imageHistory));
        console.log('Historique des images sauvegardé:', imageHistory);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'historique des images:', error);
      }
    }
  }, [imageHistory]);
  
  // Déboguer les changements d'état pour l'historique des images
  useEffect(() => {
    console.log('Mode actif:', activeMode);
    console.log('ID historique image actuel:', currentImageHistoryId);
    console.log('Historique des images actuel:', imageHistory);
  }, [activeMode, currentImageHistoryId, imageHistory]);

  // Charger une conversation existante
  const handleLoadConversation = (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages || []);
    }
  };
  
  // Changer de mode
  const handleModeChange = (modeId) => {
    console.log(`Changement de mode: ${activeMode} -> ${modeId}`);
    
    // Sauvegarder l'état actuel avant de changer de mode
    if (activeMode === 'chat' && currentConversationId) {
      // Sauvegarder l'état de la conversation actuelle si nécessaire
      try {
        localStorage.setItem('tibot-conversations', JSON.stringify(conversations));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des conversations:', error);
      }
    } else if (activeMode === 'image' && imageHistory.length > 0) {
      // Sauvegarder l'état de l'historique des images
      try {
        localStorage.setItem('tibot-image-history', JSON.stringify(imageHistory));
        console.log('Historique des images sauvegardé avant changement de mode:', imageHistory);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'historique des images:', error);
      }
    }
    
    // Changer de mode
    setActiveMode(modeId);
    
    // Charger l'historique approprié pour le nouveau mode
    if (modeId === 'chat') {
      // Charger la dernière conversation si elle existe
      if (conversations.length > 0) {
        handleLoadConversation(conversations[0].id);
      }
    } else if (modeId === 'image') {
      try {
        // Recharger l'historique des images depuis le localStorage
        const savedImageHistory = localStorage.getItem('tibot-image-history');
        console.log('Historique des images récupéré du localStorage:', savedImageHistory);
        
        if (savedImageHistory) {
          const loadedImageHistory = JSON.parse(savedImageHistory);
          console.log('Historique des images parsé:', loadedImageHistory);
          
          if (loadedImageHistory && loadedImageHistory.length > 0) {
            // Mettre à jour l'état avec l'historique chargé
            setImageHistory(loadedImageHistory);
            
            // Charger la dernière génération d'image
            const latestEntry = loadedImageHistory[0];
            console.log('Chargement de l\'entrée la plus récente:', latestEntry);
            setCurrentImageHistoryId(latestEntry.id);
            setImagePrompt(latestEntry.prompt || '');
            setSelectedImageStyle(latestEntry.style || 'realistic');
            setGeneratedImages(latestEntry.images || []);
            return;
          }
        }
        
        // Si aucun historique n'est trouvé ou s'il est vide
        console.log('Aucun historique d\'images trouvé ou historique vide');
        setImageHistory([]);
        setImagePrompt('');
        setGeneratedImages([]);
        setCurrentImageHistoryId(null);
        setSelectedImageStyle('realistic');
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique des images:', error);
        // Réinitialiser en cas d'erreur
        setImageHistory([]);
        setImagePrompt('');
        setGeneratedImages([]);
        setCurrentImageHistoryId(null);
        setSelectedImageStyle('realistic');
      }
    }
  };

  // Supprimer une conversation
  const handleDeleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    localStorage.setItem('tibot-conversations', JSON.stringify(updatedConversations));
    
    // Si la conversation courante est supprimée
    if (conversationId === currentConversationId) {
      if (updatedConversations.length > 0) {
        // Charger la conversation la plus récente
        handleLoadConversation(updatedConversations[0].id);
      } else {
        // Créer une nouvelle conversation
        handleNewChat();
      }
    }
  };

  useEffect(() => {
    const changeLanguage = async () => {
      try {
        if (language !== i18n.language) {
          await i18n.changeLanguage(language);
          setMessages([
            { id: 1, type: 'bot', content: t('welcome') }
          ]);
        }
      } catch (error) {
        console.error('Erreur lors du changement de langue:', error);
      }
    };
    changeLanguage();
  }, [language, i18n, t]);

  const [inputValue, setInputValue] = useState('');

  const modes = [
    { id: 'chat', name: t('chat'), icon: MessageCircle, color: darkMode ? 'text-cyan-400' : 'text-cyan-600' },
    { id: 'image', name: t('image'), icon: Image, color: darkMode ? 'text-orange-400' : 'text-orange-500' },
    { id: 'code', name: t('code'), icon: Code, color: darkMode ? 'text-emerald-400' : 'text-emerald-600' }
  ];

  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedImageStyle, setSelectedImageStyle] = useState('realistic');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [imageError, setImageError] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [aiModel, setAiModel] = useState('tibot-base');
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dataUsage, setDataUsage] = useState('optimize');
  const [fontSize, setFontSize] = useState('normal');

  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => {
      setSettingsSaved(false);
      setShowSettings(false);
    }, 1500);
  };
  
  // Fonction pour générer du code avec l'API
  const handleGenerateCode = async () => {
    if (!codePrompt.trim()) {
      return;
    }
    
    setIsGenerating(true);
    setCopied(false);
    
    try {
      const response = await window.electron.code.generate(codePrompt, selectedLanguage, codeLevel);
      
      if (response.success) {
        setGeneratedCode(response.data.code);
      } else {
        console.error('Erreur lors de la génération de code:', response.error);
        // Afficher un message d'erreur à l'utilisateur
        setGeneratedCode(`// Erreur: ${response.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la génération de code:', error);
      setGeneratedCode(`// Erreur: ${error.message || 'Une erreur est survenue'}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Fonction pour copier le code généré
  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [userName, setUserName] = useState('');

  const onboardingSteps = [
    {
      title: "Bienvini dan Ti'Bot! 🌴",
      subtitle: "Out premié assistant IA kréol",
      content: "Mi lé kontan woir aou! Ti'Bot sé in assistant intelizan ki konpran kréol rényoné ek fransé. Ansanm nou va fé bann zafer impresionan!",
      image: "🤖",
      action: "Alon komansé!"
    },
    {
      title: "Koman ou i apèl?",
      subtitle: "Pou mi koné koman kozé ek ou",
      content: "Avan nou komans, di mwin out ti non pou mi pé pèrsonalizé out lexpérians.",
      image: "👋",
      input: true,
      action: "Kontinyé"
    },
    {
      title: "Bann mod Ti'Bot",
      subtitle: "Shwazi sak ou i vé fér",
      content: "Ti'Bot i propoz 3 mod prinsipal:",
      features: [
        { icon: "💬", name: "Kozé", desc: "Poz tout kalité kestion, mi répon an kréol ou fransé" },
        { icon: "🎨", name: "Zimaz", desc: "Dekri sak ou i imajin, mi kré bann zimaz pou ou" },
        { icon: "⚡", name: "Kod", desc: "Mi èd aou kod dan tout bann langaz" }
      ],
      image: "✨",
      action: "Dékouvèr"
    },
    {
      title: "Mod klér ou mod nwar?",
      subtitle: "Shwazi sak lé pli konfortab pou out zié",
      content: "Ti'Bot i pé marsh dan mod zour ou mod nuit. Ou pé shanj kan ou vé dan bann paramèt!",
      image: darkMode ? "🌙" : "☀️",
      toggle: true,
      action: "Swivan"
    },
    {
      title: "Paré pou komansé!",
      subtitle: `Bienvini ${userName || 'kamarad'}!`,
      content: "Ou lé paré pou itiliz Ti'Bot! Rapèl: mi konpran kréol ek fransé, donk koz natirèl ek mwin. Si ou i bezwin lèd, apiy sir bann paramèt.",
      image: "🚀",
      action: "Komans kozé ek Ti'Bot!"
    }
  ];

  const currentStep = onboardingSteps[onboardingStep];

  const handleOnboardingNext = () => {
    if (onboardingStep === 1 && !userName.trim()) {
      setUserName('Kamarad');
    }
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setShowOnboarding(false);
      localStorage.setItem('tibot-onboarding-completed', 'true');
    }
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('tibot-onboarding-completed', 'true');
  };

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('tibot-onboarding-completed');
    if (onboardingCompleted) {
      setShowOnboarding(false);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      const userMessage = {
        type: 'user',
        content: inputValue,
        timestamp: new Date().toISOString()
      };

      // Ajouter le message à la conversation actuelle
      const updatedConversations = conversations.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...(conv.messages || []), userMessage],
            title: conv.messages?.length === 0 ? userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? '...' : '') : conv.title,
            updatedAt: new Date().toISOString()
          };
        }
        return conv;
      });

      setConversations(updatedConversations);
      localStorage.setItem('tibot-conversations', JSON.stringify(updatedConversations));
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);

      const response = await window.electron.mistral.chat(inputValue, language);
      
      if (response.success) {
        const botMessage = {
          type: 'bot',
          content: response.data,
          timestamp: new Date().toISOString(),
          isNew: true // Marquer le message comme nouveau pour l'effet de frappe
        };
        
        // Ajouter la réponse du bot à la conversation
        const updatedWithBotMessage = updatedConversations.map(conv => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: [...(conv.messages || []), botMessage],
              updatedAt: new Date().toISOString()
            };
          }
          return conv;
        });

        setConversations(updatedWithBotMessage);
        localStorage.setItem('tibot-conversations', JSON.stringify(updatedWithBotMessage));
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = {
        type: 'bot',
        content: t('errors.aiError'),
        timestamp: new Date().toISOString(),
        isNew: true // Marquer le message d'erreur comme nouveau pour l'effet de frappe
      };

      // Ajouter le message d'erreur à la conversation
      const updatedWithError = conversations.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...(conv.messages || []), errorMessage],
            updatedAt: new Date().toISOString()
          };
        }
        return conv;
      });

      setConversations(updatedWithError);
      localStorage.setItem('tibot-conversations', JSON.stringify(updatedWithError));
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Créer une nouvelle entrée dans l'historique des images
  const handleNewImageGeneration = () => {
    const newImageEntry = {
      id: `img-${Date.now()}`,
      title: imagePrompt.slice(0, 30) + (imagePrompt.length > 30 ? '...' : ''),
      prompt: imagePrompt,
      style: selectedImageStyle,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Récupérer l'historique actuel du localStorage pour éviter les pertes de données
    let currentHistory = [];
    try {
      const savedHistory = localStorage.getItem('tibot-image-history');
      if (savedHistory) {
        currentHistory = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des images:', error);
    }
    
    // Fusionner avec l'historique en mémoire
    const mergedHistory = [...imageHistory];
    
    // Vérifier si des entrées du localStorage ne sont pas dans l'historique en mémoire
    currentHistory.forEach(savedEntry => {
      if (!mergedHistory.some(entry => entry.id === savedEntry.id)) {
        mergedHistory.push(savedEntry);
      }
    });
    
    // Ajouter la nouvelle entrée au début de l'historique
    const updatedImageHistory = [newImageEntry, ...mergedHistory];
    
    // Mettre à jour l'état et le localStorage
    setImageHistory(updatedImageHistory);
    setCurrentImageHistoryId(newImageEntry.id);
    setGeneratedImages([]);
    
    try {
      localStorage.setItem('tibot-image-history', JSON.stringify(updatedImageHistory));
      console.log('Nouvelle entrée ajoutée à l\'historique:', newImageEntry);
      console.log('Historique complet après ajout:', updatedImageHistory);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique des images:', error);
    }
    
    return newImageEntry;
  };
  
  // Charger une entrée existante de l'historique des images
  const handleLoadImageHistory = (historyId) => {
    const historyEntry = imageHistory.find(entry => entry.id === historyId);
    if (historyEntry) {
      setCurrentImageHistoryId(historyId);
      setImagePrompt(historyEntry.prompt);
      setSelectedImageStyle(historyEntry.style);
      setGeneratedImages(historyEntry.images);
    }
  };
  
  // Supprimer une entrée de l'historique des images
  const handleDeleteImageHistory = (historyId) => {
    const updatedImageHistory = imageHistory.filter(entry => entry.id !== historyId);
    setImageHistory(updatedImageHistory);
    localStorage.setItem('tibot-image-history', JSON.stringify(updatedImageHistory));
    
    // Si l'entrée courante est supprimée
    if (historyId === currentImageHistoryId) {
      if (updatedImageHistory.length > 0) {
        // Charger l'entrée la plus récente
        handleLoadImageHistory(updatedImageHistory[0].id);
      } else {
        // Réinitialiser les champs
        setCurrentImageHistoryId(null);
        setImagePrompt('');
        setGeneratedImages([]);
      }
    }
  };

  const handleGenerateImage = async () => {
    if (imagePrompt.trim()) {
      setIsGenerating(true);
      setImageError(null);
      
      // Créer ou mettre à jour l'entrée dans l'historique
      let currentEntry;
      if (!currentImageHistoryId || imageHistory.find(entry => entry.id === currentImageHistoryId)?.prompt !== imagePrompt) {
        // Créer une nouvelle entrée si le prompt a changé ou s'il n'y a pas d'entrée courante
        currentEntry = handleNewImageGeneration();
      } else {
        // Utiliser l'entrée existante
        currentEntry = imageHistory.find(entry => entry.id === currentImageHistoryId);
      }
      
      try {
        const response = await window.electron.stableDiffusion.generateImage(imagePrompt, selectedImageStyle);
        
        if (response.success) {
          // Transformer les données reçues en format attendu par l'interface
          const images = response.data.map(img => ({
            id: img.id,
            url: img.base64,
            prompt: img.prompt,
            style: img.style,
            createdAt: img.createdAt
          }));
          
          // Mettre à jour l'état local
          setGeneratedImages(images);
          
          // Récupérer l'historique actuel du localStorage pour éviter les pertes de données
          let currentHistory = [];
          try {
            const savedHistory = localStorage.getItem('tibot-image-history');
            if (savedHistory) {
              currentHistory = JSON.parse(savedHistory);
            }
          } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique des images:', error);
          }
          
          // Fusionner avec l'historique en mémoire pour éviter de perdre des entrées
          let mergedHistory = [...imageHistory];
          
          // Vérifier si des entrées du localStorage ne sont pas dans l'historique en mémoire
          currentHistory.forEach(savedEntry => {
            if (!mergedHistory.some(entry => entry.id === savedEntry.id)) {
              mergedHistory.push(savedEntry);
            }
          });
          
          // Mettre à jour l'entrée actuelle avec les nouvelles images
          const updatedImageHistory = mergedHistory.map(entry => {
            if (entry.id === currentEntry.id) {
              return {
                ...entry,
                images: images,
                updatedAt: new Date().toISOString()
              };
            }
            return entry;
          });
          
          // Trier l'historique par date de mise à jour (plus récent en premier)
          updatedImageHistory.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          
          // Mettre à jour l'état local
          setImageHistory(updatedImageHistory);
          
          // Sauvegarder dans le localStorage
          try {
            localStorage.setItem('tibot-image-history', JSON.stringify(updatedImageHistory));
            console.log('Historique des images mis à jour après génération:', updatedImageHistory);
          } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'historique des images:', error);
          }
        } else {
          throw new Error(response.error || 'Erreur lors de la génération de l\'image');
        }
      } catch (error) {
        console.error('Erreur de génération d\'image:', error);
        setImageError(error.message || 'Erreur lors de la génération de l\'image');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  // Exemple de code pour les tests (utilisé uniquement si l'API n'est pas disponible)
  const getExampleCode = (language) => {
    const codeExamples = {
      python: `# Kalkil pou fé in bon kari poulet
def fe_kari_poulet(nb_moun):
    """Kalkil bann zingrédian pou in kari poulet"""
    poulet = nb_moun * 200  # 200g par moun
    oignon = nb_moun * 0.5  # 0.5 oignon par moun
    tomat = nb_moun * 2    # 2 tomat par moun
    
    print(f"Pou {nb_moun} moun, ou i dwa:")
    print(f"- {poulet}g poulet")
    print(f"- {oignon} oignon")
    print(f"- {tomat} tomat")
    print("- Epis: kurkuma, piman, lay, zanzib")
    
fe_kari_poulet(6)`,
      javascript: `// Fonksion pou kalkil bann zilé tropikal
function calculateIslandDistance(lat1, lon1, lat2, lon2) {
  // Formul Haversine pou kalkil distans
  const R = 6371; // Rayon la Ter en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance.toFixed(2) + ' km';
}

// Distans ant La Rénion ek Moris
console.log(calculateIslandDistance(-21.1151, 55.5364, -20.3484, 57.5522));`
    };
    return codeExamples[language] || codeExamples.python;
  };

  // La fonction handleCopyCode est déjà définie plus haut dans le fichier

  const imageStyles = [
    { name: 'realistic', icon: '🌊', desc: t('imageStylesDesc.realistic') },
    { name: 'artistic', icon: '🎨', desc: t('imageStylesDesc.artistic') },
    { name: 'tropical', icon: '🌺', desc: t('imageStylesDesc.tropical') },
    { name: 'fantasy', icon: '✨', desc: t('imageStylesDesc.fantasy') }
  ];
  
  const handleSelectImageStyle = (styleName) => {
    setSelectedImageStyle(styleName);
  };

  const codeExamples = [
    { lang: 'python', name: t('codeExamples.python') },
    { lang: 'javascript', name: t('codeExamples.javascript') },
    { lang: 'html', name: t('codeExamples.html') }
  ];

  const TypingIndicator = () => (
    <div className="flex items-start space-x-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500 to-cyan-600`}>
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className={`px-4 py-3 rounded-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (window.electron) {
      window.electron.on('system-theme-changed', (event, shouldUseDark) => {
        if (useSystemTheme) {
          setDarkMode(shouldUseDark);
        }
      });

      return () => {
        if (window.electron) {
          window.electron.removeAllListeners('system-theme-changed');
        }
      };
    }
  }, [useSystemTheme]);

  const handleLanguageChange = (newLanguage) => {
    console.log('Changement de langue vers:', newLanguage);
    const languageToSet = newLanguage === 'creole' ? 'creole' : 'french';
    if (languageToSet !== language) {
      setLanguage(languageToSet);
      i18n.changeLanguage(languageToSet).then(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.type === 'bot' ? { ...msg, content: t('welcome') } : msg
          )
        );
      });
    }
  };

  const [isPromptMenuOpen, setIsPromptMenuOpen] = useState(false);

  const handlePromptSelect = (promptText) => {
    setInputValue(promptText);
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TitleBar darkMode={darkMode} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed top-8 left-0 h-[calc(100vh-2rem)] w-64 transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64'
        } ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        } flex flex-col z-10`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="Ti'Bot" 
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h1 className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Ti'Bot</h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('modes')}
            </p>
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all transform hover:scale-105 ${
                  activeMode === mode.id 
                    ? darkMode 
                      ? 'bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-600' 
                      : 'bg-gradient-to-r from-cyan-50 to-cyan-100 border border-cyan-200'
                    : darkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                }`}
              >
                <mode.icon className={`w-5 h-5 ${activeMode === mode.id ? mode.color : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`font-medium ${
                  activeMode === mode.id 
                    ? darkMode ? 'text-gray-100' : 'text-gray-800'
                    : darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {mode.name}
                </span>
                {activeMode === mode.id && (
                  <div className="ml-auto w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 px-4 py-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('history')}
              </p>
              
              {/* Bouton Nouvelle conversation (mode chat) */}
              {activeMode === 'chat' && (
                <button
                  onClick={handleNewChat}
                  className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('newChat')}</span>
                </button>
              )}
              
              {/* Bouton Nouvelle image (mode image) */}
              {activeMode === 'image' && (
                <button
                  onClick={() => {
                    // Réinitialiser les champs pour une nouvelle image
                    setImagePrompt('');
                    setSelectedImageStyle('realistic'); // Réinitialiser le style par défaut
                    setGeneratedImages([]);
                    setCurrentImageHistoryId(null);
                    setImageError(null);
                  }}
                  className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('newImage')}</span>
                </button>
              )}
            </div>
            
            {/* Historique des conversations (mode chat) */}
            {activeMode === 'chat' && (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div 
                    key={conversation.id}
                    className={`group flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:translate-x-1 ${
                      currentConversationId === conversation.id
                        ? darkMode 
                          ? 'bg-gray-700 text-gray-100'
                          : 'bg-gray-100 text-gray-900'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <button 
                      onClick={() => handleLoadConversation(conversation.id)}
                      className="flex-1 text-left truncate"
                    >
                      {conversation.title}
                    </button>
                    <button
                      onClick={() => handleDeleteConversation(conversation.id)}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity ${
                        darkMode 
                          ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                          : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Historique des images (mode image) */}
            {activeMode === 'image' && (
              <div className="space-y-1">
                {imageHistory.map((entry) => (
                  <div 
                    key={entry.id}
                    className={`group flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:translate-x-1 ${
                      currentImageHistoryId === entry.id
                        ? darkMode 
                          ? 'bg-gray-700 text-gray-100'
                          : 'bg-gray-100 text-gray-900'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <button 
                      onClick={() => handleLoadImageHistory(entry.id)}
                      className="flex-1 text-left truncate"
                    >
                      {entry.title}
                    </button>
                    <button
                      onClick={() => handleDeleteImageHistory(entry.id)}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity ${
                        darkMode 
                          ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                          : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Message si aucun historique n'est disponible */}
            {((activeMode === 'chat' && conversations.length === 0) || 
              (activeMode === 'image' && imageHistory.length === 0)) && (
              <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p className="text-sm">{t('noHistory')}</p>
              </div>
            )}
          </div>

          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <button 
              onClick={() => setShowSettings(true)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all hover:translate-x-1 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <Settings className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('settings')}</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
          <header className={`border-b px-4 py-3 transition-colors ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {sidebarOpen ? 
                    <X className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} /> : 
                    <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  }
                </button>
                <div className="flex items-center space-x-2">
                  {activeMode === 'chat' && <MessageCircle className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />}
                  {activeMode === 'image' && <Image className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />}
                  {activeMode === 'code' && <Code className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />}
                  <h2 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {activeMode === 'chat' && t('chatHeader')}
                    {activeMode === 'image' && t('sections.imageCreation')}
                    {activeMode === 'code' && t('sections.codeGenerator')}
                  </h2>
                </div>
              </div>
              <button 
                onClick={handleNewChat}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Plus className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('newChat')}</span>
              </button>
            </div>
          </header>

          {activeMode === 'chat' && (
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <h1 className={`text-2xl font-bold mb-8 text-center max-w-2xl ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {welcomeTitle}
                  </h1>
                  <div className="w-full max-w-3xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 relative group">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder={t('inputPlaceholder')}
                          className={`w-full px-4 py-3 pr-12 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <div className="relative">
                            <button 
                              onClick={() => setIsPromptMenuOpen(!isPromptMenuOpen)}
                              className={`p-2 transition-all hover:scale-110 ${
                                darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              <Sparkles className="w-5 h-5" />
                            </button>
                            <PromptMenu
                              isOpen={isPromptMenuOpen}
                              onClose={() => setIsPromptMenuOpen(false)}
                              darkMode={darkMode}
                              onSelect={handlePromptSelect}
                              position="bottom"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {language === 'french' 
                        ? "Comme tout assistant, Ti'Bot n'est pas infaillible. Vérifiez ses réponses."
                        : "Kom tout IA, Ti'Bot i pe tronp a li. Vérifié sak li di."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="w-full px-2 mb-6">
                    {messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn mb-4`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className={`flex items-start space-x-2 ${
                          message.type === 'user' 
                            ? 'flex-row-reverse space-x-reverse ml-auto' 
                            : 'mr-auto'
                        } w-fit max-w-[95%]`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 flex-shrink-0 ${
                            message.type === 'bot' 
                              ? 'bg-gradient-to-br from-cyan-500 to-cyan-600' 
                              : 'bg-gradient-to-br from-cyan-500 to-cyan-600'
                          }`}>
                            {message.type === 'bot' ? 
                              <Bot className="w-5 h-5 text-white" /> : 
                              <User className="w-5 h-5 text-white" />
                            }
                          </div>
                          <div className={`px-4 py-2.5 rounded-2xl transition-all hover:shadow-lg ${
                            message.type === 'bot' 
                              ? darkMode 
                                ? 'bg-gray-800 border border-gray-700' 
                                : 'bg-white border border-gray-200'
                              : darkMode
                                ? 'bg-cyan-600 text-white'
                                : 'bg-cyan-600 text-white'
                          }`}>
                            <div className={`prose ${
                              message.type === 'bot' 
                                ? darkMode 
                                  ? 'prose-invert prose-headings:text-gray-100 prose-p:text-gray-300 prose-strong:text-cyan-300 prose-em:text-gray-200 prose-blockquote:text-cyan-200 prose-blockquote:border-cyan-500 prose-blockquote:bg-gray-700/30 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-sm prose-li:text-gray-300 prose-li:marker:text-cyan-400' 
                                  : 'prose-neutral'
                                : 'text-white prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-blockquote:text-white prose-li:text-white'
                            } prose-sm max-w-none prose-blockquote:border-l-4 prose-li:my-0 prose-p:my-2 ${
                              darkMode ? 'prose-blockquote:border-cyan-500' : ''
                            }`}>
                              {message.type === 'bot' ? (
                                <TypingEffect 
                                  content={message.content}
                                  className={message.type === 'bot' ? '' : 'text-white'}
                                  isNew={message.isNew || false}
                                />
                              ) : (
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start animate-fadeIn mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500 to-cyan-600">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className={`px-6 py-4 rounded-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1" />
                </div>
              )}
            </div>
          )}

          {activeMode === 'image' && (
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8 animate-fadeIn">
                  <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {t('imageHeader')}
                  </h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('imageDescription')}
                  </p>
                </div>

                <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg animate-fadeIn`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Palette className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                    <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {t('imagePromptTitle')}
                    </h3>
                  </div>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder={t('imagePrompt')}
                    className={`w-full px-4 py-3 rounded-lg resize-none h-24 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } border`}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      {imageStyles.map((style) => (
                        <button 
                          key={style.name}
                          onClick={() => handleSelectImageStyle(style.name)}
                          className={`px-3 py-1.5 rounded-lg text-sm flex items-center space-x-1 transition-all hover:scale-105 ${
                            selectedImageStyle === style.name
                              ? darkMode 
                                ? 'bg-orange-600 text-white' 
                                : 'bg-orange-500 text-white'
                              : darkMode 
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                          title={style.desc}
                        >
                          <span>{style.icon}</span>
                          <span>{t(`imageStyles.${style.name}`)}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGenerating}
                      className={`px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95 ${
                        isGenerating 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('generating')}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{t('generateImage')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {generatedImages.length === 0 && !isGenerating && !imageError && (
                  <div className={`text-center py-12 animate-fadeIn ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                      <Image className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-lg mb-2">{t('empty.images')}</p>
                    <p className="text-sm">{t('empty.imagesDesc')}</p>
                  </div>
                )}
                
                {imageError && (
                  <div className={`text-center py-8 animate-fadeIn ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} rounded-xl p-6`}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                    <p className={`text-lg mb-2 font-medium ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                      {t('errors.imageGenerationFailed')}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {imageError}
                    </p>
                    <button
                      onClick={() => setImageError(null)}
                      className={`mt-4 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {t('tryAgain')}
                    </button>
                  </div>
                )}

                {generatedImages.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    {generatedImages.map((img, index) => (
                      <div 
                        key={img.id} 
                        className={`rounded-xl overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-2xl ${
                          darkMode ? 'bg-gray-800' : 'bg-white'
                        }`}
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="aspect-square bg-gradient-to-br from-cyan-100 to-orange-100 relative group">
                          <img src={img.url} alt={`Generated ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                            <button 
                              className="p-2 bg-white rounded-lg shadow-lg transform hover:scale-110 transition-all"
                              title={t('downloadImage')}
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = img.url;
                                link.download = `tibot_image_${Date.now()}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="w-5 h-5 text-gray-700" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t('variation')} #{index + 1}
                          </p>
                          <p className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} title={img.prompt}>
                            {img.prompt.length > 50 ? img.prompt.substring(0, 50) + '...' : img.prompt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMode === 'code' && (
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8 animate-fadeIn">
                  <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {t('codeHeader')}
                  </h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('codeDescription')}
                  </p>
                </div>

                <div className="mb-6">
                  <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('codeExamplesTitle')}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {codeExamples.map((example) => (
                      <button
                        key={example.lang}
                        onClick={() => setCodePrompt(t('codeExamplePrompt', { example: example.name, language: selectedLanguage }))}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-105 ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' 
                            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {example.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg animate-fadeIn`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Terminal className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {t('codePromptTitle')}
                      </h3>
                    </div>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      } border`}
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="html">HTML/CSS</option>
                    </select>
                  </div>
                  <textarea
                    value={codePrompt}
                    onChange={(e) => setCodePrompt(e.target.value)}
                    placeholder={t('codePlaceholder')}
                    className={`w-full px-4 py-3 rounded-lg resize-none h-24 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } border font-mono text-sm`}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{t('codeLevel')}:</span>
                      <button 
                        onClick={() => setCodeLevel('beginner')}
                        className={`px-3 py-1 rounded-lg transition-all hover:scale-105 ${
                          codeLevel === 'beginner'
                            ? (darkMode ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                            : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')
                        }`}
                      >
                        {t('codeLevels.beginner')}
                      </button>
                      <button 
                        onClick={() => setCodeLevel('advanced')}
                        className={`px-3 py-1 rounded-lg transition-all hover:scale-105 ${
                          codeLevel === 'advanced'
                            ? (darkMode ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                            : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')
                        }`}
                      >
                        {t('codeLevels.advanced')}
                      </button>
                    </div>
                    <button
                      onClick={handleGenerateCode}
                      disabled={isGenerating}
                      className={`px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95 ${
                        isGenerating 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('generating')}</span>
                        </>
                      ) : (
                        <>
                          <Code className="w-4 h-4" />
                          <span>{t('generateCode')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {!generatedCode && !isGenerating && (
                  <div className={`text-center py-12 animate-fadeIn ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                      <Code className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-lg mb-2">{t('readyToCode.title')}</p>
                    <p className="text-sm">{t('readyToCode.description')}</p>
                    <div className="mt-6 flex justify-center space-x-4">
                      <div className="text-xs">
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t('codeLanguages.python')}</span>
                        <span className="mx-1">•</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t('codeLanguages.js')}</span>
                        <span className="mx-1">•</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t('codeLanguages.java')}</span>
                        <span className="mx-1">•</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t('codeLanguages.cpp')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {generatedCode && (
                  <div className={`rounded-xl overflow-hidden shadow-lg animate-fadeIn ${
                    darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-900'
                  }`}>
                    <div className={`flex items-center justify-between px-4 py-3 ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-800'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-400 text-sm font-mono">{selectedLanguage}</span>
                      </div>
                      <div className="flex items-center">
                        <button 
                          onClick={handleCopyCode}
                          className="px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                          {copied ? 
                            <>
                              <Check className="w-4 h-4 text-green-400" />
                              <span className="text-xs">Copié</span>
                            </> : 
                            <>
                              <Copy className="w-4 h-4" />
                              <span className="text-xs">Copier</span>
                            </>
                          }
                        </button>
                      </div>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code className="text-sm text-gray-300 font-mono whitespace-pre">
                        {generatedCode}
                      </code>
                    </pre>
                    <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-700 bg-gray-800'}`}>
                      <p className="text-xs text-gray-400">
                        ✨ Kod-la i respekt bann prensip kréol • Komandir klér an kréol/fransé
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMode === 'chat' && messages.length > 0 && (
            <div className={`border-t px-4 py-4 transition-colors ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={t('inputPlaceholder')}
                      className={`w-full px-4 py-3 pr-12 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="relative">
                        <button 
                          onClick={() => setIsPromptMenuOpen(!isPromptMenuOpen)}
                          className={`p-2 transition-all hover:scale-110 ${
                            darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Sparkles className="w-5 h-5" />
                        </button>
                        <PromptMenu
                          isOpen={isPromptMenuOpen}
                          onClose={() => setIsPromptMenuOpen(false)}
                          darkMode={darkMode}
                          onSelect={handlePromptSelect}
                          position="top"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {language === 'french' 
                    ? "Comme tout assistant, Ti'Bot n'est pas infaillible. Vérifiez ses réponses."
                    : "Kom tout IA, Ti'Bot i pe tronp a li. Vérifié sak li di."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal des paramètres */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-start justify-end">
          <div className={`w-full max-w-md h-screen ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-y-auto`}>
            <div className="sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-lg bg-opacity-80 bg-inherit border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
                  <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    Paramètres
                  </h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Langue */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Globe className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
                  <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Langue
                  </h3>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleLanguageChange('french')}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      language === 'french'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : darkMode
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Français</span>
                      {language === 'french' && <Check className="w-4 h-4 text-cyan-500" />}
                    </div>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('creole')}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      language === 'creole'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : darkMode
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kréol Rényoné</span>
                      {language === 'creole' && <Check className="w-4 h-4 text-cyan-500" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Confidentialité et données */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
                  <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Confidentialité et données
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Sauvegarde automatique
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Garder l'historique des conversations
                      </p>
                    </div>
                    <button
                      onClick={() => setAutoSave(!autoSave)}
                      className={`relative w-11 h-6 transition-all rounded-full ${
                        autoSave ? 'bg-cyan-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute w-5 h-5 transition-all transform rounded-full top-0.5 ${
                        autoSave ? 'right-0.5 bg-white' : 'left-0.5 bg-gray-100'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Notifications
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Alertes des nouvelles fonctionnalités
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative w-11 h-6 transition-all rounded-full ${
                        notifications ? 'bg-cyan-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute w-5 h-5 transition-all transform rounded-full top-0.5 ${
                        notifications ? 'right-0.5 bg-white' : 'left-0.5 bg-gray-100'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Apparence et thème */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Palette className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
                  <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Apparence et thème
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Thème
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setDarkMode(false);
                          setUseSystemTheme(false);
                        }}
                        className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-lg transition-all ${
                          !darkMode && !useSystemTheme
                            ? 'bg-cyan-500 text-white'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        <span>Clair</span>
                      </button>
                      <button
                        onClick={() => {
                          setDarkMode(true);
                          setUseSystemTheme(false);
                        }}
                        className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-lg transition-all ${
                          darkMode && !useSystemTheme
                            ? 'bg-cyan-500 text-white'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        <span>Sombre</span>
                      </button>
                      <button
                        onClick={() => setUseSystemTheme(true)}
                        className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-lg transition-all ${
                          useSystemTheme
                            ? 'bg-cyan-500 text-white'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Cpu className="w-4 h-4" />
                        <span>Système</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Taille du texte
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setFontSize('small')}
                        className={`flex-1 p-2 rounded-lg transition-all ${
                          fontSize === 'small'
                            ? 'bg-cyan-500 text-white'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Petit
                      </button>
                      <button
                        onClick={() => setFontSize('normal')}
                        className={`flex-1 p-2 rounded-lg transition-all ${
                          fontSize === 'normal'
                            ? 'bg-cyan-500 text-white'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        onClick={() => setFontSize('large')}
                        className={`flex-1 p-2 rounded-lg transition-all ${
                          fontSize === 'large'
                            ? 'bg-cyan-500 text-white'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Grand
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aide et guides */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <HelpCircle className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
                  <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Aide et guides
                  </h3>
                </div>
                <div className="space-y-2">
                  <button className={`w-full text-left p-3 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Guide d'utilisation</span>
                  </button>
                  <button className={`w-full text-left p-3 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>FAQ</span>
                  </button>
                  <button className={`w-full text-left p-3 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Signaler un problème</span>
                  </button>
                </div>
              </div>

              {/* Déconnexion */}
              <button
                className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg transition-all ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>

            <div className="sticky bottom-0 z-10 px-6 py-4 border-t backdrop-blur-lg bg-opacity-80 bg-inherit border-gray-700">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Version 1.0.0
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      settingsSaved
                        ? 'bg-green-500 text-white'
                        : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    }`}
                  >
                    {settingsSaved ? 'Enregistré !' : 'Sauvegarder'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = TiBotInterface;
export default App;