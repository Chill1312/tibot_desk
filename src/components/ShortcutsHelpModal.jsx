import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ShortcutsHelpModal = ({ isOpen, onClose, darkMode }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;
  
  // Définir les raccourcis par catégorie
  const shortcutCategories = {
    navigation: [
      { key: 'Ctrl+N', description: 'Nouvelle conversation' },
      { key: 'Ctrl+H', description: 'Afficher/masquer l\'historique' },
      { key: 'Escape', description: 'Fermer les fenêtres modales' }
    ],
    modes: [
      { key: 'Ctrl+1', description: 'Mode discussion' },
      { key: 'Ctrl+2', description: 'Mode image' },
      { key: 'Ctrl+3', description: 'Mode code' }
    ],
    actions: [
      { key: 'Ctrl+Enter', description: 'Envoyer le message' },
      { key: 'Ctrl+S', description: 'Sauvegarder la conversation' }
    ],
    interface: [
      { key: 'Ctrl+D', description: 'Basculer mode sombre/clair' },
      { key: 'Ctrl+,', description: 'Ouvrir les paramètres' },
      { key: 'Ctrl+P', description: 'Ouvrir la personnalisation' }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-2xl max-h-[80vh] rounded-lg shadow-xl overflow-hidden ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('shortcuts.title')}
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 60px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(shortcutCategories).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {t(`shortcuts.${category}`)}
                </h3>
                <div className={`rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {shortcuts.map((shortcut) => (
                    <div 
                      key={shortcut.key} 
                      className={`flex justify-between items-center p-2 ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                      } border-b last:border-b-0`}
                    >
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {shortcut.description}
                      </span>
                      <kbd className={`px-2 py-1 text-xs font-semibold rounded ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('shortcuts.tip')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsHelpModal;
