Je vais créer les deux fichiers demandés avec un code complet et fonctionnel.

src/components/Andy/MessageBubble.jsx:
```jsx
import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

const MessageBubble = ({
  message,
  isUser = false,
  isPremium = false,
  timestamp,
  avatar,
  onAction,
  showActions = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const messageRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), 100);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (messageRef.current) {
      observer.observe(messageRef.current);
    }

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (messageRef.current) {
      setIsOverflowing(
        messageRef.current.scrollHeight > messageRef.current.clientHeight
      );
    }
  }, [message]);

  const handleAction = (action) => {
    if (onAction) {
      onAction(action);
    }
  };

  const sanitizedMessage = DOMPurify.sanitize(message, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'a', 'code', 'br'],
    ALLOWED_ATTR: ['href', 'title', 'class']
  });

  return (
    <div
      ref={messageRef}
      className={`message-bubble-container ${isUser ? 'user-message' : 'andy-message'} ${isVisible ? 'visible' : ''}`}
      style={{
        '--delay': `${Math.random() * 100}ms`
      }}
    >
      <div
        className={`message-bubble ${isUser ? 'user' : 'andy'} ${isPremium ? 'premium' : ''} ${isExpanded ? 'expanded' : ''}`}
        style={{
          animationDelay: 'var(--delay)'
        }}
      >
        {!isUser && isPremium && (
          <div className="premium-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>Premium</span>
          </div>
        )}

        <div
          className="message-content"
          dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
        />

        {isOverflowing && !isExpanded && (
          <button
            className="expand-button"
            onClick={() => setIsExpanded(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        )}

        {isExpanded && isOverflowing && (
          <button
            className="collapse-button"
            onClick={() => setIsExpanded(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        )}

        {timestamp && (
          <div className="message-time">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {showActions && !isUser && (
        <div className="message-actions">
          <button
            className="action-button"
            onClick={() => handleAction('copy')}
            title="Copier"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button
            className="action-button"
            onClick={() => handleAction('share')}
            title="Partager"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16,6 12,2 8,6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
```

src/components/Andy/Andy.jsx:
```jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import { MessageSquare, Send, Sparkles, Settings, Copy, Share, Bot, User, Crown } from 'lucide-react';

const Andy = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [premiumMode, setPremiumMode] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: userMessage,
        isUser: true,
        timestamp: new Date().toISOString(),
        avatar: 'U'
      }
    ]);

    setIsTyping(true);

    try {
      // Simulate API call
      setTimeout(async () => {
        const response = await generateResponse(userMessage);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: response,
            isUser: false,
            isPremium: premiumMode,
            timestamp: new Date().toISOString(),
            avatar: 'A'
          }
        ]);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Désolé, une erreur est survenue. Veuillez réessayer.",
          isUser: false,
          timestamp: new Date().toISOString(),
          avatar: 'A'
        }
      ]);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, premiumMode, isLoading]);

  const generateResponse = async (message) => {
    // Simulate different response types based on premium mode
    if (premiumMode) {
      return `🔥 Réponse Premium pour: "${message}"\n\n` +
             `Voici une analyse approfondie avec des insights exclusifs et des recommandations stratégiques.\n` +
             `Les données sont traitées en temps réel avec une priorité maximale.\n\n` +
             `Exemple de contenu premium:\n• Analyse technique détaillée\n• Recommandations d'investissement\n• Stratégies avancées\n• Accès à des sources exclusives`;
    } else {
      return `Réponse standard pour: "${message}"\n\n` +
             `Je traite votre demande avec les informations disponibles.\n` +
             `Pour un accès premium, activez le mode Premium pour des réponses avancées et des analyses exclusives.`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAction = (messageId, action) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(
          messages.find(m => m.id === messageId)?.text || ''
        );
        break;
      case 'share':
        // Simulate share action
        console.log('Share message:', messageId);
        break;
      default:
        break;
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <div className="andy-container">
      <div className="andy-header">
        <div className="header-content">
          <div className="header-title">
            <Bot size={24} />
            <h2>AnDy</h2>
          </div>
          <div className="header-controls">
            <button
              className={`premium-toggle ${premiumMode ? 'active' : ''}`}
              onClick={() => setPremiumMode(!premiumMode)}
              title={premiumMode ? "Mode Standard" : "Mode Premium"}
            >
              <Crown size={16} />
              <span>{premiumMode ? "Premium" : "Standard"}</span>
            </button>
            <button
              className="clear-button"
              onClick={clearConversation}
              title="Nouvelle conversation"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="andy-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} />
            <h3>Bienvenue sur AnDy</h3>
            <p>Posez-moi une question ou dites-moi ce dont vous avez besoin</p>
            <div className="example-prompts">
              <button
                className="prompt-button"
                onClick={() => {
                  setInputValue("Quelles sont les dernières actualités sur les cryptomonnaies ?");
                  inputRef.current?.focus();
                }}
              >
                Crypto
              </button>
              <button
                className="prompt-button"
                onClick={() => {
                  setInputValue("Quel est le score du PSG ce soir ?");
                  inputRef.current?.focus();
                }}
              >
                Sports
              </button>
              <button
                className="prompt-button"
                onClick={() => {
                  setInputValue("Analyse le graphique Bitcoin/USD");
                  inputRef.current?.focus();
                }}
              >
                Analyse
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              isPremium={message.isPremium}
              timestamp={message.timestamp}
              avatar={message.avatar}
              onAction={(action) => handleAction(message.id, action)}
              showActions={!message.isUser}
            />
          ))
        )}

        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <span>AnDy est en train de rédiger...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="andy-input">
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question à AnDy..."
            disabled={isLoading}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            <Send size={20} />
          </button>
        </div>
        <div className="input-hint">
          <span>↵ pour envoyer</span>
          <span>⇧↵ pour nouvelle ligne</span>
        </div>
      </div>
    </div>
  );
};

export default Andy;