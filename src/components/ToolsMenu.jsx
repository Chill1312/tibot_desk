import React from 'react';
import { RefreshCw, Terminal, Database, HelpCircle } from 'lucide-react';

const ToolsMenu = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  const tools = [
    {
      icon: RefreshCw,
      label: 'Redémarrer',
      action: () => window.electron.invoke('window-control', 'reload')
    },
    {
      icon: Terminal,
      label: 'Console',
      action: () => window.electron.invoke('window-control', 'toggle-devtools')
    },
    {
      icon: Database,
      label: 'Effacer données',
      action: () => {
        localStorage.clear();
        window.electron.invoke('window-control', 'reload');
      }
    },
    {
      icon: HelpCircle,
      label: 'À propos',
      action: () => window.electron.invoke('window-control', 'about')
    }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className={`absolute top-8 left-0 z-50 w-48 py-2 rounded-lg shadow-xl ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {tools.map((tool, index) => (
          <button
            key={index}
            onClick={() => {
              tool.action();
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm ${
              darkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <tool.icon className="w-4 h-4" />
            <span>{tool.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default ToolsMenu; 