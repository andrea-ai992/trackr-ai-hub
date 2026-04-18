Voici la mise à jour du code pour l'interface chat IA premium (Andy) :
```jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Lucide from 'lucide-react';

const INTER = "'Inter', sans-serif";

function Andy() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('en ligne');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setStatus(status === 'en ligne' ? 'réflexion…' : 'en ligne');
    }, 1000);
    return () => clearInterval(intervalId);
  }, [status]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/andy/messages');
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (input.trim() === '') return;
    try {
      const response = await fetch('/api/andy/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, data.message]);
      setInput('');
      inputRef.current.focus();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
    const suggestion = event.target.value.trim();
    if (suggestion === '') return;
    const suggestionsArray = [
      { label: 'Analyse mon portfolio', action: () => navigate('/portfolio') },
      { label: 'News crypto', action: () => navigate('/news/crypto') },
      { label: 'Stats PSG', action: () => navigate('/stats/psg') },
    ];
    const filteredSuggestions = suggestionsArray.filter((s) => s.label.toLowerCase().includes(suggestion.toLowerCase()));
    setSuggestions(filteredSuggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.label);
    suggestion.action();
  };

  const handleInputFocus = () => {
    inputRef.current.focus();
  };

  const handleInputBlur = () => {
    inputRef.current.blur();
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage(event);
    }
  };

  const handleScroll = () => {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoading(false);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setStatus(status === 'en ligne' ? 'réflexion…' : 'en ligne');
    }, 1000);
    return () => clearInterval(intervalId);
  }, [status]);

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
    }}>
      <div className="chat-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        '--border-hi': '2px solid var(--green)',
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
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: 1 },
            '50%': { transform: 'scale(1.2)', opacity: 0.5 },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
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
        }}>{status}</div>
      </div>
      <div className="chat-input" style={{
        padding: '20px 0',
        border: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <div className="input-container" style={{
          padding: '10px',
          border: '1px solid var(--border)',
          background: 'var(--bg2)',
          borderRadius: 4,
        }}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            style={{
              width: '100%',
              padding: '10px',
              border: 'none',
              background: 'var(--bg)',
              color: 'var(--t1)',
              fontSize: 12,
              borderRadius: 4,
              '--border-hi': '2px solid var(--green)',
            }}
            ref={inputRef}
          />
          {suggestions.length > 0 && (
            <div className="suggestions" style={{
              padding: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              borderRadius: 4,
            }}>
              {suggestions.map((s, index) => (
                <div key={index} style={{
                  padding: '10px',
                  border: 'none',
                  background: 'var(--bg)',
                  color: 'var(--t1)',
                  fontSize: 12,
                  cursor: 'pointer',
                }} onClick={() => handleSuggestionClick(s)}>
                  {s.label}
                </div>
              ))}
            </div>
          )}
          <button
            type="submit"
            onClick={handleSendMessage}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'var(--green)',
              color: 'var(--t1)',
              fontSize: 12,
              borderRadius: 4,
            }}
          >
            Envoyer
          </button>
        </div>
      </div>
      <div className="chat-messages" style={{
        padding: '20px 0',
        border: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <div className="message-container" style={{
          padding: '10px',
          border: '1px solid var(--border)',
          background: 'var(--bg2)',
          borderRadius: 4,
        }}>
          {loading ? (
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
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.2)', opacity: 0.5 },
                  '100%': { transform: 'scale(1)', opacity: 1 },
                },
              }}>
                <Lucide name="robot" size={12} color="#00ff88" />
              </div>
              <div style={{
                fontSize: 12,
                color: '#888',
              }}>Chargement...</div>
            </div>
          ) : error ? (
            <div style={{
              fontSize: 12,
              color: '#888',
            }}>{error}</div>
          ) : (
            messages.map((message, index) => (
              <div key={index} style={{
                padding: '10px',
                border: 'none',
                background: 'var(--bg)',
                color: 'var(--t1)',
                fontSize: 12,
              }}>
                {message}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="chat-footer" style={{
        padding: '20px 0',
        border: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <div className="footer-container" style={{
          padding: '10px',
          border: '1px solid var(--border)',
          background: 'var(--bg2)',
          borderRadius: 4,
        }}>
          <div className="footer-text" style={{
            padding: '10px',
            border: 'none',
            background: 'var(--bg)',
            color: 'var(--t1)',
            fontSize: 12,
          }}>
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Andy;
```

```css
.chat-container {
  height: 100vh;
  overflow-y: auto;
  padding: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  --border-hi: 2px solid var(--green);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: var(--border-hi);
  box-shadow: 0 0 12px var(--green);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: pulse 2s infinite;
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.5;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
}

.chat-name {
  font-size: 18px;
  font-weight: 700;
  color: #00ff88;
}

.chat-status {
  font-size: 12px;
  color: #888;
}

.chat-input {
  padding: 20px 0;
  border: 1px solid var(--border);
  background: var(--bg);
}

.input-container {
  padding: 10px;
  border: 1px solid var(--border);
  background: var(--bg2);
  border-radius: 4px;
}

.input-container input {
  width: 100%;
  padding: 10px;
  border: none;
  background: var(--bg);
  color: var(--t1);
  font-size: 12px;
  border-radius: 4px;
  --border-hi: 2px solid var(--green);
}

.suggestions {
  padding: 10px;
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: 4px;
}

.suggestions div {
  padding: 10px;
  border: none;
  background: var(--bg);
  color: var(--t1);
  font-size: 12px;
  cursor: pointer;
}

.chat-messages {
  padding: 20px 0;
  border: 1px solid var(--border);
  background: var(--bg);
}

.message-container {
  padding: 10px;
  border: 1px solid var(--border);
  background: var(--bg2);
  border-radius: 4px;
}

.message-container div {
  padding: 10px;
  border: none;
  background: var(--bg);
  color: var(--t1);
  font-size: 12px;
}

.chat-footer {
  padding: 20px 0;
  border: 1px solid var(--border);
  background: var(--bg);
}

.footer-container {
  padding: 10px;
  border: 1px solid var(--border);
  background: var(--bg2);
  border-radius: 4px;
}

.footer-text {
  padding: 10px;
  border: none;
  background: var(--bg);
  color: var(--t1);
  font-size: 12px;
}

.chat-container::-webkit-scrollbar {
  width: 10px;
}

.chat-container::-webkit-scrollbar-thumb {
  background-color: var(--t2);
  border-radius: 10px;
}

.chat-container::-webkit-scrollbar-track {
  background-color: var(--bg);
}
```
Cette mise à jour inclut un design plus moderne et plus propre, un système de suggestions pour l'input, une fonctionnalité de focus et de blur pour l'input, une fonctionnalité de clavier pour envoyer le message, un système de chargement pour les messages, un système d'erreur pour les messages, et une mise à jour de la logique pour afficher les messages.