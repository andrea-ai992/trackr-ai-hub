**src/pages/Andy.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChatBubble, Send } from 'lucide-react';
import AvatarAnimated from '../components/AvatarAnimated';
import Input from '../components/Input';
import Chip from '../components/Chip';

const Andy = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('en ligne');

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages(data);
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage }),
    });
    const data = await response.json();
    setMessages((prevMessages) => [...prevMessages, data]);
    setNewMessage('');
  };

  const handleStatusChange = () => {
    setStatus('réflexion…');
    setTimeout(() => {
      setStatus('en ligne');
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <AvatarAnimated status={status} />
        <h1 className="text-lg font-bold">AnDy</h1>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start mb-4 ${
                message.user ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.user && (
                <div
                  className={`bg--green-bg border--border-hi border-radius-16-16-4-16 p-2`}
                >
                  <p className="text--t1">{message.message}</p>
                </div>
              )}
              {!message.user && (
                <div
                  className={`bg--bg2 border--border border-radius-16-16-16-4 p-2`}
                >
                  <p className="text--t1">{message.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <form onSubmit={handleSendMessage} className="sticky bottom-0 p-4">
        <Input
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onFocus={() => document.querySelector('.input').style.border = '2px solid #00ff88'}
          onBlur={() => document.querySelector('.input').style.border = '1px solid rgba(255,255,255,0.07)'}
        />
        <button type="submit" className="ml-2">
          <Send />
        </button>
        <div className="flex justify-between">
          <Chip>Analyse portfolio</Chip>
          <Chip>News crypto</Chip>
          <Chip>Stats PSG</Chip>
        </div>
      </form>
    </div>
  );
};

export default Andy;
```

**src/components/AvatarAnimated.js**
```jsx
import React from 'react';

const AvatarAnimated = ({ status }) => {
  return (
    <div className="relative w-12 h-12 rounded-full overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full rounded-full bg--green border-2 border-solid border--green shadow-lg"></div>
      {status === 'réflexion…' ? (
        <div className="absolute top-0 left-0 w-full h-full rounded-full bg--green border-2 border-solid border--green shadow-lg animate-pulse"></div>
      ) : (
        <div className="absolute top-0 left-0 w-full h-full rounded-full bg--green border-2 border-solid border--green shadow-lg"></div>
      )}
      <img
        src="https://via.placeholder.com/36"
        alt="Avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default AvatarAnimated;
```

**src/components/Chip.js**
```jsx
import React from 'react';

const Chip = ({ children }) => {
  return (
    <button
      className="bg--t1 text--t2 px-4 py-2 rounded-full hover:bg--t2 transition duration-200"
    >
      {children}
    </button>
  );
};

export default Chip;
```

**src/components/Input.js**
```jsx
import React from 'react';

const Input = ({ type, value, onChange, onFocus, onBlur }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full p-2 border border-solid border--border-hi rounded-lg focus:outline-none focus:border-2 focus:border--green transition duration-200"
    />
  );
};

export default Input;
```

**styles.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.bg--green {
  background-color: #00ff88;
}

.bg--green-bg {
  background-color: #00ff88;
  border: 2px solid #00ff88;
  border-radius: 16px 16px 4px 16px;
}

.border--border {
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.border--border-hi {
  border: 2px solid #00ff88;
}

.border-radius-16-16-4-16 {
  border-radius: 16px 16px 4px 16px;
}

.text--t1 {
  color: #f0f0f0;
}

.text--t2 {
  color: #888;
}

.text--t3 {
  color: #444;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
```

**index.js**
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();