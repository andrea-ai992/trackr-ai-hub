Je vais créer le fichier `src/utils/validation.js` avec un système de validation strict pour les paramètres query/body, puis l'intégrer dans `src/pages/Andy.jsx`.

```javascript
// src/utils/validation.js
export const validateUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateMessageBody = (body) => {
  if (!body || typeof body !== 'object') return false;

  const { sessionId, message, context } = body;

  if (!validateUUID(sessionId)) {
    return { valid: false, error: 'sessionId must be a valid UUID' };
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { valid: false, error: 'message is required and must be a non-empty string' };
  }

  if (context && typeof context !== 'object') {
    return { valid: false, error: 'context must be an object if provided' };
  }

  return { valid: true };
};

export const validateQueryParams = (params) => {
  if (!params || typeof params !== 'object') return false;

  const { sessionId } = params;

  if (!validateUUID(sessionId)) {
    return { valid: false, error: 'sessionId query parameter must be a valid UUID' };
  }

  return { valid: true };
};

export const validateChatInput = (input) => {
  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return { valid: false, error: 'Input must be a non-empty string' };
  }

  return { valid: true };
};
```

Maintenant, je vais modifier `src/pages/Andy.jsx` pour intégrer ces validations :

```javascript
// src/pages/Andy.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validateUUID, validateMessageBody, validateQueryParams, validateChatInput } from '../utils/validation';

const Andy = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Validation des paramètres de query
  useEffect(() => {
    const validation = validateQueryParams(Object.fromEntries(searchParams));
    if (!validation.valid) {
      setError(validation.error);
      navigate('/andy', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSendMessage = async () => {
    const inputValidation = validateChatInput(inputValue);
    if (!inputValidation.valid) {
      setError(inputValidation.error);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionId = searchParams.get('sessionId');
      if (!validateUUID(sessionId)) {
        throw new Error('Invalid session ID');
      }

      const response = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'user', content: inputValue }, { role: 'assistant', content: data.response }]);
      setInputValue('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>AnDy</h1>
        <p>IA Autonome - Andrea Matlega</p>
      </header>

      <div className="messages-container">
        {error && <div className="error-message">{error}</div>}

        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Bienvenue dans AnDy.</p>
            <p>Entrez votre message ci-dessous pour commencer une conversation.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-role">{msg.role}</div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre message ici..."
          disabled={isLoading}
          rows={3}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          className="send-button"
        >
          {isLoading ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
};

export default Andy;