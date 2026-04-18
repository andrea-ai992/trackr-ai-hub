Voici le code complet et fonctionnel pour le système de suggestions rapides interactives intégré dans `Andy.jsx` avec le composant `ThinkingAnimation.jsx` :

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const suggestionsRef = useRef(null);

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
      setShowSuggestions(false);
      return;
    }

    const suggestionsArray = [
      { label: 'Analyse mon portfolio', action: () => navigate('/portfolio') },
      { label: 'News crypto', action: () => navigate('/news/crypto') },
      { label: 'Stats PSG', action: () => navigate('/stats/psg') },
      { label: 'Cours Bitcoin', action: () => navigate('/markets/crypto/bitcoin') },
      { label: 'NBA Scores', action: () => navigate('/sports/nba') },
      { label: 'PSG Classement', action: () => navigate('/sports/psg/classement') },
      { label: 'Cours Ethereum', action: () => navigate('/markets/crypto/ethereum') },
      { label: 'UFC prochains combats', action: () => navigate('/sports/ufc') },
      { label: 'Analyse technique Bitcoin', action: () => navigate('/patterns/bitcoin') },
      { label: 'Prévisions marché crypto', action: () => navigate('/markets/crypto') },
    ];

    const filteredSuggestions = suggestionsArray.filter((s) =>
      s.label.toLowerCase().includes(suggestion.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
    setShowSuggestions(filteredSuggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.label);
    suggestion.action();
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    inputRef.current.focus();
    if (input.trim() !== '') {
      const suggestionsArray = [
        { label: 'Analyse mon portfolio', action: () => navigate('/portfolio') },
        { label: 'News crypto', action: () => navigate('/news/crypto') },
        { label: 'Stats PSG', action: () => navigate('/stats/psg') },
        { label: 'Cours Bitcoin', action: () => navigate('/markets/crypto/bitcoin') },
        { label: 'NBA Scores', action: () => navigate('/sports/nba') },
        { label: 'PSG Classement', action: () => navigate('/sports/psg/classement') },
        { label: 'Cours Ethereum', action: () => navigate('/markets/crypto/ethereum') },
        { label: 'UFC prochains combats', action: () => navigate('/sports/ufc') },
        { label: 'Analyse technique Bitcoin', action: () => navigate('/patterns/bitcoin') },
        { label: 'Prévisions marché crypto', action: () => navigate('/markets/crypto') },
      ];
      setSuggestions(suggestionsArray);
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="chat-container" style={{
      padding: '20px',
      fontFamily: INTER,
      fontSize: 12,
      color: 'var(--t1)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg)',
    }}>
      <div className="chat-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
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
          color: 'var(--green)',
        }}>AnDy</div>
        <div className="chat-status" style={{
          fontSize: 12,
          color: 'var(--t2)',
        }}>
          {status === 'réflexion…' ? <ThinkingAnimation isThinking={true} /> : status}
        </div>
        {loading && status !== 'réflexion…' && (
          <div className="loading-indicator" style={{
            fontSize: 12,
            color: 'var(--t2)',
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
                background: 'var(--green)',
                animation: 'pulse 2s infinite',
              }} />
              <div className="dot" style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--green)',
                animation: 'pulse 2s infinite',
              }} />
              <div className="dot" style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--green)',
                animation: 'pulse 2s infinite',
              }} />
            </div>
            <div style={{ color: 'var(--t2)' }}>Chargement...</div>
          </div>
        )}
      </div>

      <div className="chat-messages" style={{
        flex: 1,
        padding: '20px 0',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg2)',
        borderRadius: 8,
        overflowY: 'auto',
        height: 'calc(100vh - 300px)',
        maxHeight: 'calc(100vh - 300px)',
      }}>
        {loading && messages.length === 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'var(--t2)',
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
            backgroundColor: 'var(--bg3)',
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
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--t1)',
                cursor: 'pointer',
              }}
            >
              Recharger
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'var(--t2)',
          }}>
            <div style={{
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 24,
                color: 'var(--green)',
                marginBottom: 10,
              }}>
                👋 Bonjour !
              </div>
              <div style={{ marginBottom: 20 }}>
                Je suis AnDy, ton assistant IA autonome
              </div>
              <div style={{
                fontSize: 14,
                color: 'var(--t3)',
              }}>
                Essaye de demander :
                <div style={{ marginTop: 10 }}>
                  <div>"Analyse mon portfolio"</div>
                  <div>"Cours Bitcoin"</div>
                  <div>"News crypto"</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                padding: '15px 20px',
                marginBottom: 15,
                backgroundColor: message.sender === 'user' ? 'var(--bg3)' : 'var(--bg)',
                borderRadius: 8,
                border: message.sender === 'user' ? '1px solid var(--border)' : '1px solid var(--border-hi)',
                maxWidth: '80%',
                marginLeft: message.sender === 'user' ? 'auto' : '0',
                marginRight: message.sender === 'user' ? '0' : 'auto',
                animation: 'fadeIn 0.3s ease-in-out',
              }}
            >
              <div style={{
                fontSize: 14,
                color: 'var(--t1)',