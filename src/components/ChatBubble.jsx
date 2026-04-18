// src/components/ChatBubble.jsx
import React from 'react';

const ChatBubble = ({ message, isUser }) => {
  const { text, isLoading } = message;

  if (isLoading) {
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] px-4 py-2 rounded-lg ${isUser ? 'bg-[--green-bg] text-black' : 'bg-[--surface-low] text-[--text-primary]'}`}>
          <div className="flex items-center space-x-2">
            <span className="animate-pulse">•</span>
            <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>•</span>
            <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>•</span>
          </div>
        </div>
      </div>
    );
  }

  const renderTextWithMarkdown = (content) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${isUser
          ? 'bg-[--green-bg] text-black border border-[--border-bright]'
          : 'bg-[--surface-low] text-[--text-primary] border border-[--border]'}`}
      >
        {renderTextWithMarkdown(text)}
      </div>
    </div>
  );
};

export default ChatBubble;