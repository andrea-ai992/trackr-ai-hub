import { useState, useEffect } from 'react';

export const ChatBubble = ({
  message,
  isUser = false,
  isTyping = false,
  delay = 0,
  onTypingEnd
}) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isTyping || !message) return;

    const timer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < message.length) {
          setDisplayedMessage(prev => prev + message.charAt(i));
          i++;
        } else {
          clearInterval(interval);
          if (onTypingEnd) onTypingEnd();
        }
      }, 30 + Math.random() * 50);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [isTyping, message, delay, onTypingEnd]);

  const bubbleClass = isUser ? 'user-bubble' : 'ai-bubble';
  const bubbleContent = isTyping ? displayedMessage : message;

  return (
    <div
      className={`chat-bubble ${bubbleClass} ${isMounted ? 'mounted' : ''}`}
      style={{ '--delay': `${delay}ms` } as React.CSSProperties}
    >
      <div className="bubble-content">
        {bubbleContent}
        {isTyping && (
          <span className="typing-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        )}
      </div>
    </div>
  );
};

export const ChatBubbleSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="chat-bubble ai-bubble skeleton">
          <div className="bubble-content">
            <div className="skeleton-line"></div>
          </div>
        </div>
      ))}
    </>
  );
};
```

```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --border: rgba(255, 255, 255, 0.07);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --font-main: 'Inter', sans-serif;
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

.chat-bubble {
  position: relative;
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-out;
  animation-fill-mode: both;
  animation-delay: var(--delay, 0ms);
  font-family: var(--font-main);
  line-height: 1.5;
  word-wrap: break-word;
}

.chat-bubble.mounted {
  animation: none;
}

.ai-bubble {
  background: var(--bg2);
  border: 1px solid var(--border);
  color: var(--t1);
  margin-left: 0;
  margin-right: auto;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.1);
}

.user-bubble {
  background: linear-gradient(135deg, var(--green), #00d4aa);
  color: #000;
  margin-left: auto;
  margin-right: 0;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.bubble-content {
  position: relative;
}

.typing-dots {
  display: inline-flex;
  gap: 3px;
  margin-left: 6px;
  vertical-align: middle;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--t2);
  border-radius: 50%;
  animation: typingDot 1.2s infinite ease-in-out;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
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

.skeleton {
  background: linear-gradient(90deg, var(--bg3) 25%, var(--bg2) 50%, var(--bg3) 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s infinite;
}

.skeleton-line {
  height: 16px;
  width: 60%;
  border-radius: 4px;
}

@keyframes skeletonShimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}