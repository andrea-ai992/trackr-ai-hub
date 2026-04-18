**src/components/Avatar.js**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const AvatarContainer = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--green);
  box-shadow: 0 0 12px var(--green);
  animation: pulse 2s infinite;
  @keyframes pulse {
    0% {
      box-shadow: 0 0 12px var(--green);
    }
    50% {
      box-shadow: 0 0 24px var(--green);
    }
    100% {
      box-shadow: 0 0 12px var(--green);
    }
  }
`;

const Avatar = () => {
  return (
    <AvatarContainer>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--green)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16v4M12 4v4" />
      </svg>
    </AvatarContainer>
  );
};

export default Avatar;
```

**src/pages/Andy.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { styled } from 'styled-components';
import Avatar from '../components/Avatar';
import Lucide from 'lucide-react';
import { Inter } from 'next/font/google';
import { SupabaseClient } from '@supabase/supabase-js';

const inter = Inter({ subsets: ['latin'] });

const Container = styled.div`
  background-color: var(--bg);
  color: var(--t1);
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid var(--border);
`;

const Status = styled.span`
  font-size: 12px;
  font-weight: bold;
  margin-left: 8px;
`;

const Messages = styled.div`
  padding: 16px;
  background-color: var(--bg2);
  border-radius: 16px;
  max-width: 600px;
  margin: 0 auto;
`;

const Message = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 16px;
  background-color: var(--green-bg);
  border: 1px solid var(--border-hi);
  margin-bottom: 16px;
`;

const MessageText = styled.span`
  font-size: 14px;
  margin-left: 16px;
`;

const MessageUser = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 16px 16px 4px 16px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  margin-bottom: 16px;
`;

const MessageUserText = styled.span`
  font-size: 14px;
  margin-left: 16px;
`;

const Chip = styled.button`
  display: inline-block;
  padding: 8px 16px;
  border: none;
  border-radius: 16px;
  background-color: var(--bg);
  color: var(--t1);
  cursor: pointer;
  margin-right: 8px;
`;

const Input = styled.input`
  padding: 8px;
  border: none;
  border-radius: 16px;
  background-color: var(--bg);
  color: var(--t1);
  width: 100%;
  box-shadow: 0 0 0 1px var(--border-hi);
  transition: box-shadow 0.2s ease-in-out;
  &:focus {
    box-shadow: 0 0 0 2px var(--border-hi);
  }
`;

const Suggestions = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--border);
`;

const SuggestionsChip = styled(Chip)`
  margin-right: 16px;
`;

const api = new SupabaseClient('https://andy-supabase.herokuapp.com');

const Andy = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('en ligne');
  const location = useLocation();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await api.from('messages').select('*');
      if (error) {
        console.error(error);
      } else {
        setMessages(data);
      }
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    const { data, error } = await api
      .from('messages')
      .insert([{ text: userMessage, user: 'AnDy' }]);
    if (error) {
      console.error(error);
    } else {
      setMessages((prevMessages) => [...prevMessages, data[0]]);
      setUserMessage('');
    }
  };

  const handleStatusChange = () => {
    setStatus(status === 'en ligne' ? 'réflexion…' : 'en ligne');
  };

  const handleInputFocus = () => {
    document.querySelector('.input').scrollIntoView({ behavior: 'smooth' });
  };

  const handleSuggestions = async () => {
    const { data, error } = await api
      .from('suggestions')
      .select('*')
      .eq('user', 'AnDy');
    if (error) {
      console.error(error);
    } else {
      setSuggestions(data);
    }
  };

  return (
    <Container>
      <Header>
        <Avatar />
        <h1>AnDy</h1>
        <Status>{status}</Status>
      </Header>
      <Messages>
        {messages.map((message, index) => (
          <Message key={index}>
            <Avatar />
            <MessageText>{message.text}</MessageText>
          </Message>
        ))}
      </Messages>
      <Input
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        onFocus={handleInputFocus}
        placeholder="Écrivez un message"
      />
      <button onClick={handleSendMessage}>Envoyer</button>
      <Suggestions>
        {suggestions.map((suggestion, index) => (
          <SuggestionsChip key={index}>
            {suggestion.text}
          </SuggestionsChip>
        ))}
      </Suggestions>
      <Chip onClick={handleSuggestions}>Suggestions</Chip>
      <Link to="/portfolio">Analyse portfolio</Link>
      <Link to="/news">News crypto</Link>
      <Link to="/stats">Stats PSG</Link>
    </Container>
  );
};

export default Andy;
```

**package.json**
```json
{
  "name": "trackr-ai-hub",
  "version": "1.0.0",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.3.0",
    "lucide-react": "^1.0.0",
    "@supabase/supabase-js": "^1.4.0"
  },
  "devDependencies": {
    "styled-components": "^5.3.5",
    "next": "^12.2.5",
    "vite": "^3.2.3"
  }
}