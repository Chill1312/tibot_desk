import React, { useState } from 'react';
import { Minus, Square, X, Settings } from 'lucide-react';
import ToolsMenu from './ToolsMenu';

const TitleBar = ({ darkMode }) => {
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  const handleMinimize = () => {
    if (window.electron) {
      window.electron.invoke('window-control', 'minimize');
    }
  };

  const handleMaximize = () => {
    if (window.electron) {
      window.electron.invoke('window-control', 'maximize');
    }
  };

  const handleClose = () => {
    if (window.electron) {
      window.electron.invoke('window-control', 'close');
    }
  };

  return (
    <div className="h-8 flex justify-between items-center bg-gray-800 select-none relative">
      <div className="flex items-center h-full">
        <button
          onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
          className="h-8 w-12 flex items-center justify-center hover:bg-gray-700 app-region-no-drag"
        >
          <Settings className="w-4 h-4 text-gray-400" />
        </button>
        <ToolsMenu 
          isOpen={isToolsMenuOpen}
          onClose={() => setIsToolsMenuOpen(false)}
          darkMode={darkMode}
        />
      </div>
      <div className="flex-1 app-region-drag" />
      <div className="flex">
        <button
          onClick={handleMinimize}
          className="h-8 w-12 flex items-center justify-center hover:bg-gray-700 app-region-no-drag"
        >
          <Minus className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-8 w-12 flex items-center justify-center hover:bg-gray-700 app-region-no-drag"
        >
          <Square className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={handleClose}
          className="h-8 w-12 flex items-center justify-center hover:bg-red-500 app-region-no-drag"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar; 