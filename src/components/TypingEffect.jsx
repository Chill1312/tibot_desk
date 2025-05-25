import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// Événement personnalisé pour notifier les changements de contenu pendant la frappe
const typingUpdateEvent = new CustomEvent('typingUpdate');

const TypingEffect = ({ content, className, isNew = false }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(!isNew);
  const typingSpeed = 10; // Ajustez la vitesse de frappe ici (en millisecondes)

  useEffect(() => {
    // Si ce n'est pas un nouveau message, afficher directement le contenu complet
    if (!isNew) {
      setDisplayedContent(content);
      setIsComplete(true);
      return;
    }
    
    // Sinon, appliquer l'effet de frappe pour les nouveaux messages
    let currentLength = 0;
    setIsComplete(false);
    setDisplayedContent('');

    const typeText = () => {
      if (currentLength <= content.length) {
        setDisplayedContent(content.slice(0, currentLength));
        currentLength++;
        
        // Émettre un événement pour signaler que le contenu a changé
        // Cela permettra de déclencher le défilement automatique
        document.dispatchEvent(typingUpdateEvent);
        
        if (currentLength <= content.length) {
          setTimeout(typeText, typingSpeed);
        } else {
          setIsComplete(true);
        }
      }
    };

    typeText();

    return () => {
      currentLength = content.length + 1; // Pour arrêter l'effet si le composant est démonté
    };
  }, [content, isNew]);

  return (
    <div className={className}>
      {isComplete ? (
        <ReactMarkdown>{content}</ReactMarkdown>
      ) : (
        <ReactMarkdown>{displayedContent}</ReactMarkdown>
      )}
    </div>
  );
};

export default TypingEffect; 