Je vais créer le composant `ThinkingAnimation.jsx` et l'intégrer dans `Andy.jsx` pour afficher l'état "en réflexion" avec une animation SVG de points clignotants en cascade.

```jsx
// src/components/ThinkingAnimation.jsx
import { useEffect, useRef } from 'react';

const INTER = "'Inter', sans-serif";

function ThinkingAnimation({ isThinking }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 120;
    canvas.height = 40;

    // Animation parameters
    const dots = [];
    const dotCount = 5;
    const dotRadius = 4;
    const spacing = 12;
    const colors = ['#00ff88', '#00e67a', '#00c853', '#00ff9d', '#64ffda'];

    // Initialize dots
    for (let i = 0; i < dotCount; i++) {
      dots.push({
        x: 20 + i * spacing,
        y: 20,
        color: colors[i % colors.length],
        delay: i * 0.2,
        opacity: 0
      });
    }

    let animationId;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((dot, index) => {
        const progress = (elapsed / 1000 - dot.delay) * 2;
        if (progress >= 0) {
          dot.opacity = Math.min(Math.max(progress, 0), 1);
        } else {
          dot.opacity = 0;
        }

        ctx.beginPath();
        ctx.arc(
          dot.x,
          dot.y,
          dotRadius * dot.opacity,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = dot.color;
        ctx.globalAlpha = dot.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      if (isThinking) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isThinking]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: INTER,
      fontSize: 12,
      color: 'var(--t2)',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: 120,
          height: 40,
        }}
      />
      <span>en réflexion...</span>
    </div>
  );
}

export default ThinkingAnimation;
```

```jsx
// src/pages/Andy.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Lucide from 'lucide-react';
import ThinkingAnimation from '../components/ThinkingAnimation';

const INTER = "'Inter', sans-serif";

function Andy() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('en ligne');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // UUID validation function
  const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Message validation function
  const validateMessage = (message) => {
    if (!message || typeof message !== 'string') {
      throw new Error('Message invalide: doit être une chaîne de caractères non vide');
    }
    if (message.trim().length === 0) {
      throw new Error('Message invalide: ne peut pas être vide');
    }
    if (message.length > 1000) {
      throw new Error('Message invalide: doit faire moins de 1000 caractères');
    }
    return true;
  };

  // API response validation
  const validateApiResponse = (response) => {
    if (!response || typeof response !== 'object') {
      throw new Error('Réponse API invalide');
    }
    if (!response.message && !response.messages) {
      throw new Error('Réponse API manquante: message ou messages requis');
    }
    return true;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setStatus(prev => prev === 'en ligne' ? 'réflexion…' : 'en ligne');
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/andy/messages');

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        validateApiResponse(data);
        setMessages(data.messages || []);
      } catch (error) {
        setError(error.message);
        console.error('Erreur lors de la récupération des messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (input.trim() === '') return;

    try {
      // Validation du message avant envoi
      validateMessage(input);

      setLoading(true);
      setError(null);
      setIsThinking(true);

      const response = await fetch('/api/andy/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          timestamp: new Date().toISOString(),
          sessionId: localStorage.getItem('sessionId') || crypto.randomUUID()
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      validateApiResponse(data);

      setMessages((prevMessages) => [...prevMessages, data.message]);
      setInput('');
      inputRef.current.focus();
    } catch (error) {
      setError(error.message);
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
    const suggestion = event.target.value.trim();
    if (suggestion === '') {
      setSuggestions([]);
      return;
    }

    const suggestionsArray = [
      { label: 'Analyse mon portfolio', action: () => navigate('/portfolio') },
      { label: 'News crypto', action: () => navigate('/news/crypto') },
      { label: 'Stats PSG', action: () => navigate('/stats/psg') },
      { label: 'Cours Bitcoin', action: () => navigate('/markets/crypto/bitcoin') },
      { label: 'NBA Scores', action: () => navigate('/sports/nba') },
      { label: 'PSG Classement', action: () => navigate('/sports/psg/classement') },
    ];

    const filteredSuggestions = suggestionsArray.filter((s) =>
      s.label.toLowerCase().includes(suggestion.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.label);
    suggestion.action();
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    inputRef.current.focus();
  };

  const handleInputBlur = () => {
    inputRef.current.blur();
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(event);
    }
  };

  const handleScroll = () => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  useEffect(() => {
    handleScroll();
  }, [messages]);

  return (
    <div className="chat-container" style={{
      padding: '20px',
      fontFamily: INTER,
      fontSize: 12,
      '--green': '#00ff88',
      '--bg': '#080808',
      '--bg2': '#111',
      '--t1': '#f0f0f0',
      '--t2': '#888',
      '--t3': '#444',
      '--border': 'rgba(255,255,255,0.07)',
      '--border-hi': '2px solid var(--green)',
    }}>
      <div className="chat-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div className="avatar" style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: 'var(--border-hi)',
          boxShadow: '0 0 12px var(--green)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'pulse 2s infinite',
        }}>
          <Lucide name="robot" size={24} color="#00ff88" />
        </div>
        <div className="chat-name" style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#00ff88',
        }}>AnDy</div>
        <div className="chat-status" style={{
          fontSize: 12,
          color: '#888',
        }}>
          {status === 'réflexion…' ? <ThinkingAnimation isThinking={true} /> : status}
        </div>
        {loading && status !== 'réflexion…' && (
          <div className="loading-indicator" style={{
            fontSize: 12,
            color: '#888',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div className="dots" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div className="dot" style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00ff88',
                animation: 'pulse 2s infinite',
              }} />
              <div className="dot" style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00ff88',
                animation: 'pulse 2s infinite',
              }} />
              <div className="dot" style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00ff88',
                animation: 'pulse 2s infinite',
              }} />
            </div>
            <div style={{ color: '#888' }}>Chargement...</div>
          </div>
        )}
      </div>

      <div className="chat-messages" style={{
        padding: '20px 0',
        border: '1px solid var(--border)',
        background: 'var(--bg)',
        overflowY: 'auto',
        height: 'calc(100vh - 200px)',
      }}>
        {loading && messages.length === 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#888',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '2px solid var(--green)',
                boxShadow: '0 0 12px var(--green)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: 'pulse 2s infinite',
              }}>
                <Lucide name="robot" size={12} color="#00ff88" />
              </div>
              <div>Initialisation de la session...</div>
            </div>
          </div>
        ) : error ? (
          <div style={{
            padding: '20px',
            background: 'var(--bg2)',
            borderRadius: 8,
            border: '1px solid var(--border)',
            color: '#ff4444',
            textAlign: 'center',
          }}>
            <Lucide name="alert-circle" size={20} color="#ff4444" style={{ marginBottom: 10 }} />
            {error}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 10,
                padding: '5px 15px',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--t1)',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              Recharger
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888',
            textAlign: 'center',
            padding: '20px',
          }}>
            <Lucide name="message-square" size={48} color="#444" style={{ marginBottom: 20 }} />
            <div style={{ fontSize: 16, marginBottom: 10 }}>Bienvenue dans votre assistant IA premium</div>
            <div style={{ fontSize: 12 }}>Poser une question pour commencer</div>
            <div style={{
              marginTop: 20,
              padding: '10px 20px',
              background: 'var(--bg2)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: 12,
            }}>
              Exemples: "Analyse mon portfolio", "Cours Bitcoin", "Stats PSG"
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} style={{
              padding: '10px',
              marginBottom: 15,
              display: 'flex',
              justifyContent: message.includes('AnDy:') ? 'flex-start' : 'flex-end',
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: message.includes('AnDy:') ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                backgroundColor: message.includes('AnDy:') ? 'var(--bg2)' : 'rgba(0, 255, 136, 0.1)',
                border: message.includes('AnDy:') ? '1px solid var(--border)' : '1px solid var(--green)',
                color: 'var(--t1)',
              }}>
                {message}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-input" style={{
        padding: '20px 0',
        border: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky',
        bottom: 0,
      }}>
        <div className="input-container" style={{
          padding: '10px',
          border: '1px solid var(--border)',
          background: 'var(--bg2)',
          borderRadius: 8,
        }}>
          <form onSubmit={handleSendMessage} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                bottom: 80,
                left: 20,
                right: 20,
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 0',
                zIndex: 1000,
              }}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: 'var(--t1)',
                      '&:hover': {
                        background: 'var(--bg3)',
                      },
                    }}
                  >
                    {suggestion.label}
                  </div>
                ))}
              </div>
            )}
            <div style={{
              display: 'flex',
              gap: 8,
            }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInput