**src/pages/Andy.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatContext } from '../context/ChatContext';
import AvatarIA from '../components/AvatarIA';
import Chip from './Chip';
import { supabase } from '../supabase';
import { useUser } from '../hooks/useUser';

const Andy = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const user = useUser();

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('content, user_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setMessages(data);
      setLoading(false);
    };
    fetchMessages();
  }, [user.id]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    const { data, error } = await supabase
      .from('messages')
      .insert([{ content: newMessage, user_id: user.id }]);
    if (error) console.error(error);
    setNewMessage('');
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('content, user_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setMessages(data);
      setLoading(false);
    };
    fetchMessages();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const suggestions = [
    { label: 'Analyse mon portfolio', onClick: () => navigate('/portfolio') },
    { label: 'News crypto', onClick: () => navigate('/news/crypto') },
    { label: 'Stats PSG', onClick: () => navigate('/stats/psg') },
    { label: 'Prévision marché', onClick: () => navigate('/market/forecast') },
  ];

  return (
    <div className="h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <h1 className="text-lg font-bold">AnDy</h1>
        <AvatarIA />
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-pulse w-4 h-4 bg--green rounded-full mr-2" />
              <div className="animate-pulse w-4 h-4 bg--green rounded-full mr-2" />
              <div className="animate-pulse w-4 h-4 bg--green rounded-full" />
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex justify-${message.user_id === user.id ? 'end' : 'start'} items-center mb-4`}
              >
                {message.user_id === user.id ? (
                  <div className="bg--green-bg p-2 rounded-lg border--border-hi">
                    <p className="text--t1">{message.content}</p>
                  </div>
                ) : (
                  <div className="bg--bg2 p-2 rounded-lg border--border-hi">
                    <p className="text--t1">{message.content}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 rounded-lg border--border"
          />
          <button
            onClick={handleSendMessage}
            className="bg--green p-2 rounded-lg border--border-hi hover:bg--green-hover"
          >
            Envoyer
          </button>
        </div>
        <div className="flex justify-center items-center">
          {suggestions.map((suggestion, index) => (
            <Chip
              key={index}
              label={suggestion.label}
              onClick={suggestion.onClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Andy;
```

**src/components/AvatarIA.jsx**
```jsx
import React from 'react';

const AvatarIA = () => {
  return (
    <div className="relative w-12 h-12 rounded-full overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg--green rounded-full animate-pulse" />
      <div className="absolute top-0 left-0 w-full h-full bg--green rounded-full animate-pulse delay-100" />
      <div className="absolute top-0 left-0 w-full h-full bg--green rounded-full animate-pulse delay-200" />
      <div className="absolute top-0 left-0 w-full h-full bg--green rounded-full" />
    </div>
  );
};

export default AvatarIA;
```

**src/components/Chip.jsx**
```jsx
import React from 'react';

const Chip = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg--bg p-2 rounded-lg border--border-hi hover:bg--bg-hover"
    >
      <p className="text--t1">{label}</p>
    </button>
  );
};

export default Chip;
```

**styles.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --border: rgba(255, 255, 255, 0.07);
  --border-hi: rgba(255, 255, 255, 0.2);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

header {
  background-color: var(--bg2);
  color: var(--t1);
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background-color: var(--bg);
  color: var(--t1);
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: var(--green);
  color: var(--t1);
  cursor: pointer;
}

button:hover {
  background-color: var(--green-hover);
}

.chip {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: var(--bg);
  color: var(--t1);
  cursor: pointer;
}

.chip:hover {
  background-color: var(--bg-hover);
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.bg--green {
  background-color: var(--green);
}

.bg--green-bg {
  background-color: var(--bg);
  border: 1px solid var(--border-hi);
}

.bg--bg2 {
  background-color: var(--bg2);
  border: 1px solid var(--border-hi);
}

.bg--bg {
  background-color: var(--bg);
}

.bg--bg-hover {
  background-color: var(--bg-hover);
}

.text--t1 {
  color: var(--t1);
}

.text--t2 {
  color: var(--t2);
}

.text--t3 {
  color: var(--t3);
}

.border--border {
  border: 1px solid var(--border);
}

.border--border-hi {
  border: 1px solid var(--border-hi);
}

.border--border-hi-hover {
  border: 1px solid var(--border-hi-hover);
}