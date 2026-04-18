**src/pages/Andy.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import AvatarIA from './AvatarIA';
import Chip from './Chip';
import { Inter } from '@next/font/google';
import { useTheme } from '../hooks/useTheme';

const inter = Inter({ subsets: ['latin'] });

const Andy = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select()
        .order('id', { ascending: false });
      if (error) {
        console.error(error);
      } else {
        setMessages(data);
      }
      setLoading(false);
    };
    getMessages();
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ user: 'AnDy', message: inputValue, timestamp: new Date() }]);
      if (error) {
        console.error(error);
      } else {
        setInputValue('');
        const newMessages = [...messages, data[0]];
        setMessages(newMessages);
      }
    }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
  };

  const handleScroll = () => {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  return (
    <div className={theme.className}>
      <header className="header">
        <AvatarIA />
        <h1>Chat AnDy</h1>
        <p>Indicateur : <span className="loading">AnDy pense…</span></p>
      </header>
      <main className="main">
        <div className="chat-container" id="chat-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.user === 'AnDy' ? 'left' : 'right'}`}>
              <p className={`text ${message.user === 'AnDy' ? 'bg2' : 'green-bg'}`}>
                {message.message}
              </p>
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={handleInput}
            placeholder="Envoyer un message"
            className="input"
          />
          <button className="send-button" onClick={handleSendMessage}>
            Envoyer
          </button>
          <div className="suggestions">
            <Chip label="Analyse mon portfolio" onClick={() => navigate('/portfolio')} />
            <Chip label="News crypto" onClick={() => navigate('/news-crypto')} />
            <Chip label="Stats PSG" onClick={() => navigate('/stats-psg')} />
            <Chip label="Prévision marché" onClick={() => navigate('/market-prediction')} />
          </div>
        </div>
      </main>
      <style jsx>{`
        .header {
          background-color: ${theme.vars.bg};
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header h1 {
          color: ${theme.vars.t1};
        }
        .header p {
          color: ${theme.vars.t2};
        }
        .loading {
          color: ${theme.vars.t3};
        }
        .main {
          padding: 1rem;
        }
        .chat-container {
          height: 80vh;
          overflow-y: auto;
          padding: 1rem;
          background-color: ${theme.vars.bg2};
          border: 1px solid ${theme.vars.border};
        }
        .message {
          margin-bottom: 1rem;
        }
        .message.left {
          align-items: flex-end;
        }
        .message.right {
          align-items: flex-start;
        }
        .text {
          padding: 0.5rem;
          border-radius: 0.5rem;
          font-family: ${inter.style.fontFamily};
        }
        .text.bg2 {
          background-color: ${theme.vars.bg2};
        }
        .text.green-bg {
          background-color: ${theme.vars.green};
          border: 1px solid ${theme.vars.borderHi};
        }
        .input-container {
          padding: 1rem;
          display: flex;
          align-items: center;
        }
        .input {
          padding: 0.5rem;
          border: none;
          border-radius: 0.5rem;
          font-family: ${inter.style.fontFamily};
        }
        .send-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          background-color: ${theme.vars.green};
          color: ${theme.vars.t1};
          cursor: pointer;
        }
        .suggestions {
          display: flex;
          align-items: center;
          margin-left: 1rem;
        }
        .chip {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          background-color: ${theme.vars.bg2};
          color: ${theme.vars.t2};
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Andy;
```

**src/components/AvatarIA.jsx**
```jsx
import React from 'react';
import { Inter } from '@next/font/google';

const inter = Inter({ subsets: ['latin'] });

const AvatarIA = () => {
  return (
    <div className="avatar">
      <div className="circle">
        <div className="pulse" />
      </div>
    </div>
  );
};

export default AvatarIA;
```

**src/components/Chip.jsx**
```jsx
import React from 'react';
import { Inter } from '@next/font/google';

const inter = Inter({ subsets: ['latin'] });

const Chip = ({ label, onClick }) => {
  return (
    <div className="chip" onClick={onClick}>
      <p>{label}</p>
    </div>
  );
};

export default Chip;
```

**src/utils/supabase.js**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
```

**src/hooks/useTheme.js**
```javascript
import { useState, useEffect } from 'react';

const useTheme = () => {
  const [theme, setTheme] = useState({
    className: '',
    vars: {
      bg: '#080808',
      bg2: '#111',
      t1: '#f0f0f0',
      t2: '#888',
      t3: '#444',
      border: 'rgba(255,255,255,0.07)',
      borderHi: 'rgba(255,255,255,0.2)',
      green: '#00ff88',
    },
  });

  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      setTheme((prevTheme) => ({ ...prevTheme, className: 'dark', vars: { ...prevTheme.vars, bg: '#000', bg2: '#111', t1: '#fff', t2: '#888', t3: '#444' } }));
    } else {
      setTheme((prevTheme) => ({ ...prevTheme, className: 'light', vars: { ...prevTheme.vars, bg: '#f0f0f0', bg2: '#fff', t1: '#333', t2: '#666', t3: '#999' } }));
    }
  }, []);

  return theme;
};

export default useTheme;