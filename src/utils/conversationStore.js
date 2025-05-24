// Gestionnaire de stockage des conversations
const CONVERSATIONS_KEY = 'tibot-conversations';

// Structure d'une conversation
// {
//   id: string,
//   title: string,
//   messages: Array<{type: 'user' | 'bot', content: string, timestamp: string}>,
//   createdAt: string,
//   updatedAt: string
// }

export const conversationStore = {
  // Récupérer toutes les conversations
  getAllConversations() {
    try {
      const conversations = localStorage.getItem(CONVERSATIONS_KEY);
      return conversations ? JSON.parse(conversations) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return [];
    }
  },

  // Nettoyer les conversations vides sauf celle spécifiée
  cleanEmptyConversations(excludeId = null) {
    try {
      const conversations = this.getAllConversations();
      const cleanedConversations = conversations.filter(conv => 
        (conv.messages && conv.messages.length > 0) || conv.id === excludeId
      );
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(cleanedConversations));
      return cleanedConversations;
    } catch (error) {
      console.error('Erreur lors du nettoyage des conversations vides:', error);
      return [];
    }
  },

  // Créer une nouvelle conversation
  createConversation() {
    try {
      const newConversation = {
        id: `conv-${Date.now()}`,
        title: 'Nouvelle conversation',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Nettoyer les conversations vides sauf la nouvelle
      const conversations = this.cleanEmptyConversations(newConversation.id);
      conversations.unshift(newConversation);
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
      return newConversation;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  },

  // Récupérer une conversation par son ID
  getConversation(id) {
    try {
      const conversations = this.getAllConversations();
      return conversations.find(conv => conv.id === id);
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      return null;
    }
  },

  // Mettre à jour une conversation
  updateConversation(id, updates) {
    try {
      const conversations = this.getAllConversations();
      const index = conversations.findIndex(conv => conv.id === id);
      
      if (index !== -1) {
        conversations[index] = {
          ...conversations[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
        return conversations[index];
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la conversation:', error);
      throw error;
    }
  },

  // Ajouter un message à une conversation
  addMessage(id, message) {
    try {
      const conversations = this.getAllConversations();
      const index = conversations.findIndex(conv => conv.id === id);
      
      if (index !== -1) {
        const conversation = conversations[index];
        if (!conversation.messages) {
          conversation.messages = [];
        }
        conversation.messages.push(message);
        
        // Mettre à jour le titre si c'est le premier message utilisateur
        if (message.type === 'user' && conversation.messages.length === 1) {
          conversation.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
        }
        
        conversation.updatedAt = new Date().toISOString();
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
        return conversation;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
      throw error;
    }
  },

  // Supprimer une conversation
  deleteConversation(id) {
    try {
      const conversations = this.getAllConversations();
      const filteredConversations = conversations.filter(conv => conv.id !== id);
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filteredConversations));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
      throw error;
    }
  }
}; 