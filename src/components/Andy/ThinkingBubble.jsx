import React from 'react';

const ThinkingBubble = ({ content }) => {
  const sanitizeXSS = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const sanitizedContent = sanitizeXSS(content);

  return (
    <div className="thinking-bubble" style={{
      maxWidth: '80%',
      margin: '0.5rem 0',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      backgroundColor: 'var(--surface-high)',
      border: '1px solid var(--border)',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.875rem',
      lineHeight: '1.4',
      color: 'var(--text-primary)',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word'
    }}>
      {sanitizedContent}
    </div>
  );
};

export default ThinkingBubble;