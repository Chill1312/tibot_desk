import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ModelSelector = ({ selectedModel, onModelChange, darkMode, position = 'bottom' }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Liste des modèles disponibles
  const models = [
    {
      id: 'mistral-7b',
      name: t('models.base.name'),
      description: t('models.base.desc'),
      icon: '🧠',
      color: 'text-cyan-500'
    },
    // Modèles à ajouter dans le futur (désactivés pour l'instant)
    {
      id: 'mistral-large',
      name: t('models.pro.name'),
      description: t('models.pro.desc'),
      icon: '🚀',
      color: 'text-purple-500',
      disabled: true
    },
    {
      id: 'mistral-creative',
      name: t('models.creative.name'),
      description: t('models.creative.desc'),
      icon: '✨',
      color: 'text-orange-500',
      disabled: true
    }
  ];

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Trouver le modèle actuellement sélectionné
  const currentModel = models.find(model => model.id === selectedModel) || models[0];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all border shadow-sm hover:shadow ${
          darkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-cyan-300 border-gray-600' 
            : 'bg-gray-100 hover:bg-gray-200 text-cyan-600 border-gray-300'
        }`}
        title={t('modelSelector.change')}
      >
        <span className="text-lg">{currentModel.icon}</span>
        <span className="text-xs font-medium">AI</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute ${position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-64 rounded-lg shadow-lg overflow-hidden z-50 ${position === 'top' ? 'animate-slideUp' : 'animate-slideDown'} ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          {/* Petit triangle pour l'effet bulle */}
          <div 
            className={`absolute ${position === 'top' ? 'bottom-[-8px] border-b border-r' : 'top-[-8px] border-t border-l'}
              left-4 w-4 h-4 transform rotate-45
              ${darkMode ? 'bg-gray-800' : 'bg-white'}
              ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          />
          <div className={`p-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('modelSelector.title')}
            </p>
          </div>
          <div className="p-1">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => {
                  if (!model.disabled) {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }
                }}
                disabled={model.disabled}
                className={`w-full flex items-start p-2 rounded-md transition-colors ${
                  model.id === selectedModel
                    ? darkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                    : darkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                } ${
                  model.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                }`}
              >
                <div className="flex-shrink-0 text-xl mr-2">{model.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {model.name}
                    </p>
                    {model.id === selectedModel && (
                      <Check className={`w-4 h-4 ${model.color}`} />
                    )}
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {model.description}
                  </p>
                  {model.disabled && (
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('modelSelector.comingSoon')}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
