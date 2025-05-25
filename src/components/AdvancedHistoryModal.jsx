import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Tag, X, Filter, SortDesc, SortAsc, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdvancedHistoryModal = ({ 
  isOpen, 
  onClose, 
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onDeleteConversation, 
  onNewChat,
  darkMode 
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  const [filteredConversations, setFilteredConversations] = useState(conversations);
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Focus sur le champ de recherche à l'ouverture
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Fermer le modal si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
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

  // Appliquer les filtres et la recherche lorsque les dépendances changent
  useEffect(() => {
    let result = [...conversations];

    // Appliquer le filtre de date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);

      result = result.filter(conv => {
        const convDate = new Date(conv.updatedAt || conv.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return convDate >= today;
          case 'week':
            return convDate >= weekAgo;
          case 'month':
            return convDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Appliquer la recherche par mot-clé
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(conv => {
        // Rechercher dans le titre
        if (conv.title.toLowerCase().includes(term)) {
          return true;
        }
        
        // Rechercher dans le contenu des messages
        if (conv.messages && conv.messages.length > 0) {
          return conv.messages.some(msg => 
            msg.content.toLowerCase().includes(term)
          );
        }
        
        return false;
      });
    }

    // Appliquer le tri
    result.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      
      return sortOrder === 'newest' 
        ? dateB - dateA 
        : dateA - dateB;
    });

    setFilteredConversations(result);
  }, [conversations, searchTerm, dateFilter, sortOrder]);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Si c'est aujourd'hui
    if (date >= today) {
      return `Aujourd'hui, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Si c'est hier
    if (date >= yesterday) {
      return `Hier, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Sinon, afficher la date complète
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Extraire un aperçu du contenu
  const getContentPreview = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return "Conversation vide";
    }
    
    // Trouver le dernier message
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const content = lastMessage.content;
    
    // Limiter la longueur de l'aperçu
    return content.length > 50 
      ? content.substring(0, 50) + '...' 
      : content;
  };

  // Gérer la sélection d'une conversation
  const handleSelectConversation = (id) => {
    onSelectConversation(id);
    onClose();
  };

  // Gérer la création d'une nouvelle conversation
  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className={`w-full max-w-md max-h-[80vh] rounded-lg shadow-xl overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* En-tête du modal */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('searchConversations')}
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
          
          {/* Champ de recherche */}
          <div className={`mt-2 flex items-center px-3 py-2 rounded-lg ${
            darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
          }`}>
            <Search className="w-4 h-4 mr-2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('searchConversations')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-transparent border-none focus:outline-none ${
                darkMode ? 'placeholder-gray-500' : 'placeholder-gray-400'
              }`}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className={`p-1 rounded-full ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                }`}
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        {/* Filtres */}
        <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            {/* Filtre par date */}
            <div className="flex space-x-1">
              <button
                onClick={() => setDateFilter('all')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  dateFilter === 'all'
                    ? darkMode 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-cyan-100 text-cyan-800'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('allTime')}
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  dateFilter === 'today'
                    ? darkMode 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-cyan-100 text-cyan-800'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('today')}
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  dateFilter === 'week'
                    ? darkMode 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-cyan-100 text-cyan-800'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('thisWeek')}
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  dateFilter === 'month'
                    ? darkMode 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-cyan-100 text-cyan-800'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('thisMonth')}
              </button>
            </div>
            
            {/* Bouton de tri */}
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className={`p-1 rounded-md ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title={sortOrder === 'newest' ? t('sortOldestFirst') : t('sortNewestFirst')}
            >
              {sortOrder === 'newest' ? (
                <SortDesc className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              ) : (
                <SortAsc className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              )}
            </button>
          </div>
        </div>
        
        {/* Liste des conversations filtrées */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {/* Bouton Nouvelle conversation */}
          <div 
            className={`p-3 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
            onClick={handleNewChat}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Plus className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('newChat')}
              </span>
            </div>
          </div>
          
          {filteredConversations.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {filteredConversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  className={`p-3 cursor-pointer ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-medium text-sm truncate ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {conversation.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(conversation.updatedAt || conversation.createdAt)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className={`p-1 rounded-md ${
                          darkMode 
                            ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                            : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getContentPreview(conversation)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-10 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">{t('noConversationsFound')}</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={`mt-2 px-3 py-1 text-xs rounded-md ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {t('clearSearch')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedHistoryModal;
