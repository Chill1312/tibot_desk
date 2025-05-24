import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const TypingEffect = ({ content, className }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const typingSpeed = 10; // Ajustez la vitesse de frappe ici (en millisecondes)

  useEffect(() => {
    let currentLength = 0;
    setIsComplete(false);
    setDisplayedContent('');

    const typeText = () => {
      if (currentLength <= content.length) {
        setDisplayedContent(content.slice(0, currentLength));
        currentLength++;
        
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
  }, [content]);

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