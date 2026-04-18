Voici une mise à jour de la fonctionnalité d'interface chat IA premium (Andy) :

```jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Lucide from 'lucide-react';

const MONO = "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Courier New', monospace";

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
      { label: 'Analyse portfolio', action: () => navigate('/portfolio') },
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

  return (
    <div style={{ padding: '20px', fontFamily: MONO, fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--green)', boxShadow: '0 0 12px var(--green)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Lucide name="robot" size={24} color="#00ff88" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#00ff88' }}>AnDy</div>
        <div style={{ fontSize: 12, color: '#888' }}>{status}</div>
      </div>
      <div style={{ padding: '20px 0', border: '1px solid #1a1a1a', background: '#080808' }}>
        <div style={{ padding: '10px', border: '1px solid #1a1a1a', background: '#080808', borderRadius: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: '100%', padding: '10px', border: '1px solid #1a1a1a', background: '#080808', borderRadius: 4 }}>
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
                  background: '#080808',
                  color: '#00ff88',
                  fontSize: 12,
                  borderRadius: 4,
                }}
              />
            </div>
            {suggestions.length > 0 && (
              <div style={{ padding: '10px', border: '1px solid #1a1a1a', background: '#080808', borderRadius: 4 }}>
                {suggestions.map((s, index) => (
                  <div key={index} style={{ padding: '10px', border: 'none', background: '#080808', color: '#00ff88', fontSize: 12, cursor: 'pointer' }} onClick={() => handleSuggestionClick(s)}>
                    {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding: '10px', border: '1px solid #1a1a1a', background: '#080808', borderRadius: 4 }}>
            <button
              type="submit"
              onClick={handleSendMessage}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: '#00ff88',
                color: '#080808',
                fontSize: 12,
                borderRadius: 4,
              }}
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
      <div style={{ padding: '20px 0', border: '1px solid #1a1a1a', background: '#080808' }}>
        <div style={{ padding: '10px', border: '1px solid #1a1a1a', background: '#080808', borderRadius: 4 }}>
          <div style={{ padding: '10px', border: 'none', background: '#080808', color: '#00ff88', fontSize: 12 }}>
            {loading ? 'Chargement...' : error ? error : messages.map((message, index) => (
              <div key={index} style={{ padding: '10px', border: 'none', background: '#080808', color: '#00ff88', fontSize: 12 }}>
                {message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Andy;
```

Cette mise à jour inclut :

*   Un design plus moderne et plus propre
*   Un système de suggestions pour l'input
*   Une fonctionnalité de focus et de blur pour l'input
*   Une fonctionnalité de clavier pour envoyer le message
*   Un système de chargement pour les messages
*   Un système d'erreur pour les messages
*   Une mise à jour de la logique pour afficher les messages

Cette mise à jour devrait améliorer l'expérience utilisateur et la facilité d'utilisation de l'interface chat.