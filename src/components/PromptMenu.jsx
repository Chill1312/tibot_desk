import React, { useEffect, useRef } from 'react';
import { MessageCircle, Book, Lightbulb, History } from 'lucide-react';

const PromptMenu = ({ isOpen, onClose, darkMode, onSelect, position = 'bottom' }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const prompts = [
    {
      icon: MessageCircle,
      label: 'Conversation libre',
      desc: 'Discuter de tout sujet',
      action: 'Parlons de...'
    },
    {
      icon: Book,
      label: 'Histoire de La Réunion',
      desc: 'Explorer notre patrimoine',
      action: 'Raconte-moi l\'histoire de...'
    },
    {
      icon: Lightbulb,
      label: 'Culture locale',
      desc: 'Traditions et coutumes',
      action: 'Explique-moi la tradition de...'
    },
    {
      icon: History,
      label: 'Expressions créoles',
      desc: 'Comprendre notre langue',
      action: 'Que signifie l\'expression...'
    }
  ];

  return (
    <div 
      ref={menuRef}
      className={`absolute ${position === 'top' ? 'bottom-[calc(100%+0.5rem)]' : 'top-[calc(100%+0.5rem)]'} 
        right-0 z-50 w-64 py-2 rounded-lg shadow-xl
        ${position === 'top' ? 'animate-slideUp' : 'animate-slideDown'}
        ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
    >
      {/* Petit triangle pour l'effet bulle */}
      <div 
        className={`absolute ${position === 'top' ? 'bottom-[-8px] border-b border-r' : 'top-[-8px] border-t border-l'}
          right-4 w-4 h-4 transform rotate-45
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
      />
      
      <div className="relative">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(prompt.action);
              onClose();
            }}
            className={`w-full flex items-start space-x-3 px-4 py-3 text-left transition-colors ${
              darkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <prompt.icon className="w-5 h-5 mt-0.5" />
            <div>
              <div className="font-medium">{prompt.label}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {prompt.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptMenu; 