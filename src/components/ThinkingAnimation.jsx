src/components/ThinkingAnimation.jsx
```jsx
import { useEffect, useState } from 'react';

const ThinkingAnimation = ({ size = 24, color = 'var(--green)' }) => {
  const [dots, setDots] = useState(Array(3).fill(false));

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        const newDots = [...prev];
        newDots.unshift(true);
        newDots.pop();
        return newDots;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="thinking-animation" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {dots.map((active, index) => (
        <span
          key={index}
          className="dot"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: active ? color : 'var(--t3)',
            transition: 'background-color 0.2s ease',
          }}
        />
      ))}
    </div>
  );
};

export default ThinkingAnimation;
```

src/components/ThinkingAnimation.css
```css
.thinking-animation {
  font-family: 'Inter', sans-serif;
}
```

src/pages/Andy.jsx
```jsx
import { useState, useEffect } from 'react';
import ThinkingAnimation from '../components/ThinkingAnimation';

const Andy = () => {
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Je réfléchis à votre demande...", sender: 'andy' }]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className="page-layout">
      <header className="page-header">
        <h1>AnDy</h1>
      </header>

      <main className="chat-container">
        <div className="messages-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <p>{msg.text}</p>
              {msg.sender === 'andy' && isThinking && <ThinkingAnimation size={16} />}
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>Envoyer</button>
        </div>
      </main>
    </div>
  );
};

export default Andy;
```

src/pages/Andy.css
```css
.page-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.page-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--green);
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.messages-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  overflow-y: auto;
}

.message {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.message.user {
  align-self: flex-end;
  background-color: var(--green);
  color: var(--bg);
  border-bottom-right-radius: 0;
}

.message.andy {
  align-self: flex-start;
  background-color: var(--bg2);
  color: var(--t1);
  border-bottom-left-radius: 0;
}

.input-area {
  display: flex;
  gap: 0.5rem;
}

.input-area input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background-color: var(--bg2);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.input-area button {
  padding: 0 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--green);
  color: var(--bg);
  cursor: pointer;
}

.input-area button:hover {
  background-color: color-mix(in srgb, var(--green), black 20%);
}