import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Wind, AlertOctagon, Info, Clock, MapPin, Send } from 'lucide-react';

const AlertesNaturelles = ({ darkMode }) => {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour l'interface de chat
  const [alerteQuery, setAlerteQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  
  // Fonction pour ajuster automatiquement la hauteur du textarea
  const autoResizeTextarea = (element) => {
    if (!element) return;
    
    // Réinitialiser la hauteur pour obtenir la hauteur correcte
    element.style.height = 'auto';
    
    // Calculer la nouvelle hauteur en fonction du contenu
    const newHeight = Math.min(Math.max(element.scrollHeight, 48), 200);
    element.style.height = `${newHeight}px`;
  };

  // Fonction pour charger les alertes depuis une API (à implémenter)
  const chargerAlertes = async () => {
    try {
      // Simuler un chargement
      setLoading(true);
      
      // Ici, nous allons simuler des données d'alerte
      // Dans une vraie application, vous feriez un appel API ici
      const donneesSimulees = [
        {
          id: 1,
          type: 'volcan',
          niveau: 'vigilance',
          titre: 'Activité volcanique au Piton de la Fournaise',
          description: 'Augmentation de l\'activité sismique détectée sous le volcan. Niveau d\'alerte: Vigilance',
          date: '2025-05-26T08:30:00',
          localisation: 'Piton de la Fournaise, La Réunion',
          conseils: 'Restez informé des mises à jour. Évitez les zones à risque.'
        },
        {
          id: 2,
          type: 'cyclone',
          niveau: 'alerte-orange',
          titre: 'Cyclone tropical en approche',
          description: 'Un système dépressionnaire se renforce et pourrait atteindre le stade de cyclone tropical dans les prochaines 48h.',
          date: '2025-05-25T14:15:00',
          localisation: 'Océan Indien Sud-Ouest',
          conseils: 'Préparez votre kit d\'urgence. Restez à l\'écoute des consignes des autorités.'
        },
        {
          id: 3,
          type: 'seisme',
          niveau: 'alerte-jaune',
          titre: 'Activité sismique modérée',
          description: 'Séisme de magnitude 4.2 ressenti dans le sud de l\'île. Pas de dégâts majeurs signalés.',
          date: '2025-05-24T22:45:00',
          localisation: 'Sud de La Réunion',
          conseils: 'Soyez prudent dans les zones sensibles. Signalez tout dégât aux autorités compétentes.'
        }
      ];

      setAlertes(donneesSimulees);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des alertes:', err);
      setError('Impossible de charger les alertes. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  // Fonction pour traiter les questions sur les alertes
  const handleSendAlerteQuery = async () => {
    if (!alerteQuery.trim()) return;
    
    try {
      // Ajouter la question de l'utilisateur aux messages du chat
      const userMessage = {
        type: 'user',
        content: alerteQuery,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setAlerteQuery('');
      setIsTyping(true);
      
      // Réinitialiser la hauteur du textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px';
      }
      
      // Simuler un délai pour la réponse (dans une vraie application, ce serait un appel API)
      setTimeout(async () => {
        try {
          // Générer une réponse basée sur la question et les alertes disponibles
          const response = await generateAlerteResponse(alerteQuery, alertes);
          
          const botMessage = {
            type: 'bot',
            content: response,
            timestamp: new Date().toISOString()
          };
          
          setChatMessages(prev => [...prev, botMessage]);
        } catch (err) {
          console.error('Erreur lors de la génération de la réponse:', err);
          
          // Message d'erreur
          const errorMessage = {
            type: 'bot',
            content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
            timestamp: new Date().toISOString(),
            isError: true
          };
          
          setChatMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      }, 1000);
      
    } catch (err) {
      console.error('Erreur lors du traitement de la question:', err);
      setError('Impossible de traiter votre question. Veuillez réessayer.');
    }
  };
  
  // Fonction pour générer une réponse basée sur la question et les alertes disponibles
  const generateAlerteResponse = async (query, alertes) => {
    // Convertir la question en minuscules pour faciliter la recherche
    const queryLower = query.toLowerCase();
    
    // Vérifier si la question concerne des alertes spécifiques
    if (queryLower.includes('volcan') || queryLower.includes('piton') || queryLower.includes('fournaise')) {
      const alerteVolcan = alertes.find(a => a.type === 'volcan');
      if (alerteVolcan) {
        return `Concernant l'activité volcanique : ${alerteVolcan.description} Le niveau d'alerte actuel est : ${getNiveauLibelle(alerteVolcan.niveau)}. ${alerteVolcan.conseils}`;
      } else {
        return "Aucune alerte volcanique n'est actuellement en cours. Le Piton de la Fournaise est en phase de repos.";
      }
    }
    
    if (queryLower.includes('cyclone') || queryLower.includes('tempête') || queryLower.includes('ouragan')) {
      const alerteCyclone = alertes.find(a => a.type === 'cyclone');
      if (alerteCyclone) {
        return `Concernant l'activité cyclonique : ${alerteCyclone.description} Le niveau d'alerte actuel est : ${getNiveauLibelle(alerteCyclone.niveau)}. ${alerteCyclone.conseils}`;
      } else {
        return "Aucune alerte cyclonique n'est actuellement en cours. La saison cyclonique s'étend de novembre à avril dans l'océan Indien.";
      }
    }
    
    if (queryLower.includes('séisme') || queryLower.includes('tremblement') || queryLower.includes('terre')) {
      const alerteSeisme = alertes.find(a => a.type === 'seisme');
      if (alerteSeisme) {
        return `Concernant l'activité sismique : ${alerteSeisme.description} Le niveau d'alerte actuel est : ${getNiveauLibelle(alerteSeisme.niveau)}. ${alerteSeisme.conseils}`;
      } else {
        return "Aucune alerte sismique n'est actuellement en cours. La Réunion est une zone à faible risque sismique.";
      }
    }
    
    // Si la question concerne les alertes en général
    if (queryLower.includes('alerte') || queryLower.includes('risque') || queryLower.includes('danger')) {
      if (alertes.length === 0) {
        return "Aucune alerte n'est actuellement en cours à La Réunion. La situation est normale.";
      } else {
        const alertesSummary = alertes.map(a => `${a.titre} (${getNiveauLibelle(a.niveau)})`).join(', ');
        return `Actuellement, il y a ${alertes.length} alerte(s) en cours à La Réunion : ${alertesSummary}. Vous pouvez me demander plus de détails sur chacune d'entre elles.`;
      }
    }
    
    // Si la question concerne les précautions ou conseils
    if (queryLower.includes('conseil') || queryLower.includes('précaution') || queryLower.includes('que faire')) {
      if (alertes.length === 0) {
        return "Aucune alerte n'est actuellement en cours, mais il est toujours bon de se préparer. Assurez-vous d'avoir un kit d'urgence, de connaître les points de rassemblement, et de suivre les consignes des autorités en cas d'alerte.";
      } else {
        // Trouver l'alerte la plus grave
        const niveauxGravite = {
          'vigilance': 1,
          'alerte-jaune': 2,
          'alerte-orange': 3,
          'alerte-rouge': 4
        };
        
        const alertesPrioritaires = [...alertes].sort((a, b) => niveauxGravite[b.niveau] - niveauxGravite[a.niveau]);
        const alertePrioritaire = alertesPrioritaires[0];
        
        return `Concernant l'alerte la plus grave actuellement (${alertePrioritaire.titre}, niveau ${getNiveauLibelle(alertePrioritaire.niveau)}), voici les conseils : ${alertePrioritaire.conseils}`;
      }
    }
    
    // Réponse par défaut si aucune correspondance spécifique n'est trouvée
    return "Je suis désolé, je n'ai pas compris votre question concernant les alertes naturelles. Vous pouvez me demander des informations sur les alertes volcaniques, cycloniques, sismiques, ou des conseils de sécurité.";
  };
  
  useEffect(() => {
    chargerAlertes();
  }, []);

  // Fonction pour obtenir la couleur de l'icône en fonction du niveau d'alerte
  const getIconColor = (niveau) => {
    switch (niveau) {
      case 'vigilance':
        return 'text-yellow-500';
      case 'alerte-jaune':
        return 'text-yellow-500';
      case 'alerte-orange':
        return 'text-orange-500';
      case 'alerte-rouge':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  // Fonction pour obtenir l'icône en fonction du type d'alerte
  const getTypeIcon = (type, niveau) => {
    const colorClass = getIconColor(niveau);
    
    switch (type) {
      case 'volcan':
        return <AlertTriangle className={`w-5 h-5 ${colorClass}`} />;
      case 'cyclone':
        return <Wind className={`w-5 h-5 ${colorClass}`} />;
      case 'seisme':
        return <AlertOctagon className={`w-5 h-5 ${colorClass}`} />;
      default:
        return <AlertCircle className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  // Fonction pour obtenir la classe CSS en fonction du niveau d'alerte
  const getNiveauClasse = (niveau) => {
    switch (niveau) {
      case 'vigilance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'alerte-jaune':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'alerte-orange':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'alerte-rouge':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Fonction pour obtenir le libellé du niveau d'alerte
  const getNiveauLibelle = (niveau) => {
    switch (niveau) {
      case 'vigilance':
        return 'Vigilance';
      case 'alerte-jaune':
        return 'Alerte Jaune';
      case 'alerte-orange':
        return 'Alerte Orange';
      case 'alerte-rouge':
        return 'Alerte Rouge';
      default:
        return 'Information';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        <p className="mt-4 text-gray-500">Chargement des alertes en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Alertes Naturelles</h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Restez informé des dernières alertes concernant les risques naturels à La Réunion.</p>
      </div>

      {alertes.length === 0 ? (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg border border-blue-200 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          <p>Aucune alerte en cours pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alertes.map((alerte) => (
            <div 
              key={alerte.id}
              className={`border rounded-lg overflow-hidden transition-all hover:shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            >
              <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}>
                    {getTypeIcon(alerte.type, alerte.niveau)}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{alerte.titre}</h3>
                    <div className={`flex items-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mt-1`}>
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      <span>{alerte.localisation}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getNiveauClasse(alerte.niveau)}`}>
                  {getNiveauLibelle(alerte.niveau)}
                </span>
              </div>
              <div className="p-4">
                <p className={`mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{alerte.description}</p>
                <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Dernière mise à jour: {new Date(alerte.date).toLocaleString('fr-FR')}</span>
                </div>
                {alerte.conseils && (
                  <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-blue-200'}`}>
                    <div className="flex items-start">
                      <Info className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      <div>
                        <p className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recommandations :</p>
                        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{alerte.conseils}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <h3 className={`font-semibold mb-2 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <Info className="w-4 h-4 mr-2 text-blue-500" />
          À propos des alertes
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
          Les alertes sont mises à jour en temps réel à partir de sources officielles. 
          En cas d'urgence, suivez toujours les consignes des autorités locales.
        </p>
      </div>
      
      {/* Zone de chat */}
      <div className="flex-1 mt-6 overflow-auto">
        {chatMessages.length > 0 ? (
          <div className="space-y-4 pb-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3/4 p-3 rounded-lg ${message.type === 'user'
                    ? darkMode
                      ? 'bg-cyan-600 text-white'
                      : 'bg-cyan-500 text-white'
                    : darkMode
                      ? message.isError
                        ? 'bg-red-900 text-white'
                        : 'bg-gray-700 text-gray-100'
                      : message.isError
                        ? 'bg-red-100 text-red-800'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                  <div className="flex space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-600'}`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-600'}`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-600'}`} style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Posez vos questions sur les alertes naturelles à La Réunion.</p>
            <p className="mt-2 text-sm">Exemples : "Quelles sont les alertes en cours ?", "Y a-t-il une alerte cyclonique ?", "Que faire en cas d'éruption volcanique ?"</p>
          </div>
        )}
      </div>
      
      {/* Zone de saisie pour les questions sur les alertes */}
      <div className="mt-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-3`}>
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={alerteQuery}
                onChange={(e) => {
                  setAlerteQuery(e.target.value);
                  autoResizeTextarea(e.target);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAlerteQuery();
                  } else {
                    // Délai court pour permettre à la valeur de se mettre à jour avant le redimensionnement
                    setTimeout(() => autoResizeTextarea(e.target), 0);
                  }
                }}
                placeholder="Posez une question sur les alertes naturelles..."
                rows="1"
                style={{
                  resize: 'none',
                  minHeight: '48px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  height: '48px' // Hauteur initiale
                }}
                className={`w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <button
              onClick={handleSendAlerteQuery}
              className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          {/* Exemples de questions */}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Exemples : </span>
            {[
              "Alertes en cours",
              "Cyclone à La Réunion",
              "Activité volcanique",
              "Conseils en cas d'alerte"
            ].map((exemple, index) => (
              <button
                key={index}
                onClick={() => {
                  setAlerteQuery(exemple);
                  if (textareaRef.current) {
                    autoResizeTextarea(textareaRef.current);
                  }
                }}
                className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {exemple}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertesNaturelles;
