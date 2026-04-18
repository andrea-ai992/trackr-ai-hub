// src/components/ChatMessage.jsx
import React from 'react';

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] px-4 py-2 rounded-lg ${isUser
          ? 'bg-[--surface-high] border border-[--border-bright] rounded-br-none'
          : 'bg-[--surface] border border-[--border] rounded-bl-none'
        }`}
      >
        <div className="whitespace-pre-wrap font-mono text-[--text-primary] text-sm">
          {message}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;