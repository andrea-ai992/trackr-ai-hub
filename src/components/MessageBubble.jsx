MessageBubble.jsx
```jsx
import { useState } from 'react';

export const MessageBubble = ({
  content,
  isUser = false,
  isSuggestion = false,
  onClick = null,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = 'px-4 py-2 rounded-lg text-sm transition-all duration-200 ease-out';
  const userClasses = 'bg-green-500/20 border border-green-500/30 ml-auto';
  const aiClasses = 'bg-bg2 border border-border';
  const suggestionClasses = 'bg-bg3 border border-border/50 hover:border-green/50';

  const getClasses = () => {
    let classes = baseClasses;
    if (isUser) {
      classes += ' ' + userClasses;
    } else if (isSuggestion) {
      classes += ' ' + suggestionClasses;
    } else {
      classes += ' ' + aiClasses;
    }

    if (onClick) {
      classes += ' cursor-pointer';
    }

    if (className) {
      classes += ' ' + className;
    }

    return classes;
  };

  return (
    <div
      className={getClasses()}
      style={{
        animation: 'fadeInScale 0.3s ease-out forwards',
        opacity: 0,
        transform: 'scale(0.95)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="font-inter">{content}</div>

      {isSuggestion && onClick && (
        <style jsx>{`
          .message-bubble {
            animation: fadeInScale 0.3s ease-out forwards;
          }
          .message-bubble:hover {
            border-color: var(--green);
            transform: translateY(-1px);
          }
          .message-bubble:hover::after {
            content: '→';
            margin-left: 4px;
            transition: all 0.2s ease;
          }
        `}</style>
      )}

      <style jsx global>{`
        @keyframes fadeInScale {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
    </div>
  );
};