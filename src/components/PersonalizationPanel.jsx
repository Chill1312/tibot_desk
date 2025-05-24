import React, { useState, useEffect } from 'react';
import { X, Check, Save, HelpCircle } from 'lucide-react';

// Composant pour afficher une info-bulle
const Tooltip = ({ children, content }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-50 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg -top-2 left-full ml-2">
          {content}
        </div>
      )}
    </div>
  );
};

// Options pour les secteurs de La Réunion
const sectorsOptions = [
  { value: "nord", label: "Nord (Saint-Denis, Sainte-Marie, Sainte-Suzanne)" },
  { value: "ouest", label: "Ouest (Saint-Paul, Le Port, La Possession, Saint-Leu)" },
  { value: "est", label: "Est (Saint-André, Bras-Panon, Saint-Benoît)" },
  { value: "sud", label: "Sud (Saint-Pierre, Saint-Louis, Le Tampon, Saint-Joseph)" },
  { value: "hautsPlainesCirques", label: "Hauts, Plaines et Cirques (Cilaos, Salazie, Plaine des Palmistes)" }
];

// Options pour les centres d'intérêt
const interestsOptions = [
  { value: "culture", label: "Culture et traditions réunionnaises" },
  { value: "cuisine", label: "Gastronomie créole" },
  { value: "nature", label: "Nature et randonnées" },
  { value: "histoire", label: "Histoire de La Réunion" },
  { value: "musique", label: "Musique et danse (maloya, séga)" },
  { value: "sport", label: "Sports et activités de plein air" },
  { value: "technologie", label: "Technologie et innovation" },
  { value: "education", label: "Éducation et formation" },
  { value: "economie", label: "Économie et entrepreneuriat" }
];

// Options pour le niveau de langue créole
const creoleOptions = [
  { value: "debutant", label: "Débutant - Je comprends quelques mots" },
  { value: "intermediaire", label: "Intermédiaire - Je comprends mais je parle peu" },
  { value: "courant", label: "Courant - Je parle et comprends bien" },
  { value: "natif", label: "Natif - Mi koz kréol tout lé jour" }
];

// Options pour le style de communication
const communicationStyleOptions = [
  { value: "formel", label: "Formel et éducatif" },
  { value: "conversationnel", label: "Conversationnel et amical" },
  { value: "direct", label: "Direct et concis" },
  { value: "creole", label: "Principalement en créole" },
  { value: "mixte", label: "Mixte français/créole" }
];

const PersonalizationPanel = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  personalization, 
  setPersonalization,
  onSave
}) => {
  const [localPersonalization, setLocalPersonalization] = useState(personalization);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalPersonalization(personalization);
  }, [personalization]);

  const handleSave = () => {
    setPersonalization(localPersonalization);
    onSave(localPersonalization);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (field, value) => {
    setLocalPersonalization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestsChange = (interest) => {
    setLocalPersonalization(prev => {
      const interests = prev.interests || [];
      if (interests.includes(interest)) {
        return {
          ...prev,
          interests: interests.filter(i => i !== interest)
        };
      } else {
        return {
          ...prev,
          interests: [...interests, interest]
        };
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end">
      <div className={`w-full max-w-md h-screen ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-y-auto`}>
        <div className="sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-lg bg-opacity-80 bg-inherit border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Save className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Personnalisation de Ti'Bot
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Nom */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Comment Ti'Bot doit-il s'adresser à vous ?
              </h3>
              <Tooltip content="Ce nom sera utilisé par Ti'Bot pour personnaliser ses réponses">
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <input
              type="text"
              value={localPersonalization.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Votre prénom ou surnom"
              className={`w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Secteur de La Réunion */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Dans quel secteur de La Réunion habitez-vous ?
              </h3>
              <Tooltip content="Ti'Bot adaptera ses recommandations en fonction de votre localisation">
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {sectorsOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange('sector', option.value)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    localPersonalization.sector === option.value
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : darkMode
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{option.label}</span>
                  {localPersonalization.sector === option.value && <Check className="w-4 h-4 text-cyan-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Niveau de créole */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Quel est votre niveau en créole réunionnais ?
              </h3>
              <Tooltip content="Ti'Bot ajustera son utilisation du créole en fonction de votre niveau">
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {creoleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange('creoleLevel', option.value)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    localPersonalization.creoleLevel === option.value
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : darkMode
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{option.label}</span>
                  {localPersonalization.creoleLevel === option.value && <Check className="w-4 h-4 text-cyan-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Style de communication */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Quel style de communication préférez-vous ?
              </h3>
              <Tooltip content="Définit le ton et le style des réponses de Ti'Bot">
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {communicationStyleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange('communicationStyle', option.value)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    localPersonalization.communicationStyle === option.value
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : darkMode
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{option.label}</span>
                  {localPersonalization.communicationStyle === option.value && <Check className="w-4 h-4 text-cyan-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Centres d'intérêt */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Quels sont vos centres d'intérêt ?
              </h3>
              <Tooltip content="Sélectionnez jusqu'à 5 centres d'intérêt pour personnaliser les réponses">
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-2">
              {interestsOptions.map((option) => {
                const isSelected = (localPersonalization.interests || []).includes(option.value);
                const isDisabled = !isSelected && (localPersonalization.interests || []).length >= 5;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => !isDisabled && handleInterestsChange(option.value)}
                    disabled={isDisabled}
                    className={`px-3 py-2 rounded-full text-sm transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-white'
                        : isDisabled
                        ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {(localPersonalization.interests || []).length}/5 centres d'intérêt sélectionnés
            </p>
          </div>

          {/* Informations supplémentaires */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Avez-vous d'autres informations à fournir à Ti'Bot ?
              </h3>
              <Tooltip content="Ajoutez des détails supplémentaires pour personnaliser davantage les réponses">
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <textarea
              value={localPersonalization.additionalInfo || ''}
              onChange={(e) => handleChange('additionalInfo', e.target.value)}
              placeholder="Ex: Je suis étudiant en informatique, j'aime les randonnées dans les cirques..."
              rows={4}
              className={`w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        <div className="sticky bottom-0 z-10 px-6 py-4 border-t backdrop-blur-lg bg-opacity-80 bg-inherit border-gray-700">
          <div className="flex items-center justify-between">
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Ces informations sont stockées localement
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg transition-all ${
                  darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                }`}
              >
                {saved ? 'Enregistré !' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPanel;
