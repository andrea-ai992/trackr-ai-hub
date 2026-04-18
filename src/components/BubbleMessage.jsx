src/components/BubbleMessage.jsx
```jsx
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

const BubbleMessage = ({
  message = '',
  sender = 'user',
  timestamp = null,
  isTyping = false,
  className = '',
  onRetry = () => {},
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const isUser = sender === 'user';
  const cleanMessage = DOMPurify.sanitize(message);
  const displayMessage = isTyping ? 'Typing...' : cleanMessage;

  const formatTime = (time) => {
    if (!time) return '';
    try {
      const date = new Date(time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`bubble-message ${isUser ? 'user' : 'assistant'} ${className}`}
      style={{
        '--delay': isTyping ? '0.3s' : '0s',
      } as React.CSSProperties}
    >
      <div className="message-bubble">
        {isTyping ? (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <div
            className="message-content"
            dangerouslySetInnerHTML={{ __html: displayMessage }}
          />
        )}
      </div>
      {!isTyping && (
        <div className="message-meta">
          <span className="timestamp">{formatTime(timestamp)}</span>
          {!isUser && message && (
            <button
              className="retry-btn"
              onClick={onRetry}
              aria-label="Retry message"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M22 11.5a10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10 10 10 0 0 1 10 10z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BubbleMessage;
```

src/components/BubbleMessage.css
```css
.bubble-message {
  --delay: 0s;

  display: flex;
  flex-direction: column;
  max-width: 90%;
  margin: 0.5rem 0;
  animation: fadeIn 0.3s ease-out var(--delay);
}

.bubble-message.user {
  align-items: flex-end;
  margin-left: auto;
}

.bubble-message.assistant {
  align-items: flex-start;
  margin-right: auto;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.95rem;
  line-height: 1.4;
  word-wrap: break-word;
  max-width: 100%;
}

.bubble-message.user .message-bubble {
  background-color: var(--green);
  color: var(--bg);
  border-bottom-right-radius: 0.25rem;
}

.bubble-message.assistant .message-bubble {
  background-color: var(--bg2);
  color: var(--t1);
  border-bottom-left-radius: 0.25rem;
}

.message-content {
  white-space: pre-wrap;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.7rem;
  color: var(--t3);
}

.timestamp {
  opacity: 0.8;
}

.retry-btn {
  background: none;
  border: none;
  color: var(--t3);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--t1);
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
}

.typing-indicator span {
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--t3);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

@media (min-width: 768px) {
  .bubble-message {
    max-width: 70%;
  }
}