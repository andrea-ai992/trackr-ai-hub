// src/components/Chat/MessageBubble.jsx
import React from 'react';

const MessageBubble = ({ message, isUser }) => {
  const formatMessage = (text) => {
    const parts = [];
    let remaining = text;

    // Extract bold text (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }
      parts.push(<strong key={`bold-${match.index}`} style={{ color: 'var(--neon)' }}>{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }

    // Extract inline code (`code`)
    const codeRegex = /`(.*?)`/g;
    let formattedParts = [];
    let currentIndex = 0;

    parts.forEach((part, i) => {
      if (typeof part === 'string') {
        let codeMatch;
        let partStr = part;
        let lastPartIndex = 0;

        while ((codeMatch = codeRegex.exec(partStr)) !== null) {
          if (codeMatch.index > lastPartIndex) {
            formattedParts.push(partStr.substring(lastPartIndex, codeMatch.index));
          }
          formattedParts.push(
            <code
              key={`code-${i}-${codeMatch.index}`}
              style={{
                backgroundColor: 'var(--surface-low)',
                color: 'var(--neon)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.9em'
              }}
            >
              {codeMatch[1]}
            </code>
          );
          lastPartIndex = codeRegex.lastIndex;
        }

        if (lastPartIndex < partStr.length) {
          formattedParts.push(partStr.substring(lastPartIndex));
        }
      } else {
        formattedParts.push(part);
      }
    });

    return formattedParts;
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        margin: '8px 12px',
        maxWidth: '90%'
      }}
    >
      <div
        style={{
          backgroundColor: isUser ? 'var(--neon)' : 'var(--surface)',
          color: isUser ? 'var(--bg)' : 'var(--text-primary)',
          padding: '12px 16px',
          borderRadius: isUser
            ? '16px 16px 4px 16px'
            : '16px 16px 16px 4px',
          border: `1px solid ${isUser ? 'var(--border-bright)' : 'var(--border)'}`,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.95em',
          lineHeight: '1.5',
          wordBreak: 'break-word',
          maxWidth: '100%'
        }}
      >
        {formatMessage(message)}
      </div>
    </div>
  );
};

export default MessageBubble;