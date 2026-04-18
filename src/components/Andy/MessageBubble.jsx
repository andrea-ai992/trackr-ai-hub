src/components/Andy/MessageBubble.jsx
```jsx
import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

const MessageBubble = ({
  message,
  isUser = false,
  isPremium = false,
  timestamp = null,
  onPremiumClick = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const bubbleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), 100);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (bubbleRef.current) {
      observer.observe(bubbleRef.current);
    }

    return () => {
      if (bubbleRef.current) {
        observer.unobserve(bubbleRef.current);
      }
    };
  }, []);

  const sanitizedMessage = DOMPurify.sanitize(message);

  const bubbleClasses = `
    message-bubble
    ${isUser ? 'user-bubble' : 'andy-bubble'}
    ${isPremium ? 'premium-bubble' : ''}
    ${isVisible ? 'visible' : ''}
  `;

  const timestampClasses = `
    timestamp
    ${isUser ? 'user-timestamp' : 'andy-timestamp'}
  `;

  return (
    <div className="message-container" ref={bubbleRef}>
      <div className={bubbleClasses}>
        <div
          className="message-content"
          dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
        />
        {timestamp && (
          <div className={timestampClasses}>
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
      {isPremium && onPremiumClick && (
        <button
          className="premium-badge"
          onClick={onPremiumClick}
          aria-label="Message premium - cliquer pour plus d'informations"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>Premium</span>
        </button>
      )}
    </div>
  );
};

export default MessageBubble;
```

src/components/Andy/MessageBubble.css
```css
.message-container {
  width: 100%;
  margin: 0.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.message-bubble {
  position: relative;
  max-width: 90%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(10px);
}

.message-bubble.visible {
  opacity: 1;
  transform: translateY(0);
}

.user-bubble {
  align-self: flex-end;
  background-color: var(--green);
  color: #080808;
  border-bottom-right-radius: 0;
}

.andy-bubble {
  align-self: flex-start;
  background-color: var(--bg2);
  color: var(--t1);
  border-bottom-left-radius: 0;
}

.premium-bubble {
  border: 2px solid var(--green);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
}

.message-content {
  font-size: inherit;
  line-height: inherit;
}

.timestamp {
  font-size: 0.65rem;
  margin-top: 0.25rem;
  opacity: 0.7;
  font-family: 'Inter', sans-serif;
}

.user-timestamp {
  color: #080808;
  text-align: right;
}

.andy-timestamp {
  color: var(--t3);
  text-align: left;
}

.premium-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: var(--bg2);
  color: var(--green);
  border: 1px solid var(--green);
  border-radius: 1rem;
  padding: 0.25rem 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.premium-badge:hover {
  background-color: rgba(0, 255, 136, 0.1);
  transform: translateY(-1px);
}

@media (min-width: 768px) {
  .message-bubble {
    max-width: 70%;
  }
}