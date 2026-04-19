import { memo } from 'react';

const MessageBubble = memo(({ content, isUser, isThinking }) => {
  if (isThinking) {
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full px-4 py-2`}>
        <div className={`max-w-[80%] px-4 py-3 rounded-lg ${isUser ? 'bg-neon text-black' : 'bg-surface text-text-primary'}`}>
          <div className="flex items-center gap-2">
            <span className="animate-pulse">...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full px-4 py-2`}>
      <div className={`max-w-[80%] px-4 py-3 rounded-lg ${isUser ? 'bg-neon text-black' : 'bg-surface text-text-primary'}`}>
        <p className="whitespace-pre-wrap break-words text-sm font-mono">{content}</p>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;