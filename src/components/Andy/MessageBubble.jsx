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