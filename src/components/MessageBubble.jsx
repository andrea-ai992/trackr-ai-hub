import { useState, useRef, useEffect, memo } from 'react';
import { Send } from 'lucide-react';

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

const QuickSuggestion = memo(({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-mono font-semibold bg-neon-glow-soft border border-border-bright rounded-full text-neon hover:bg-neon-glow transition-colors"
    >
      {text}
    </button>
  );
});

QuickSuggestion.displayName = 'QuickSuggestion';

const Andy = () => {
  const [messages, setMessages] = useState([
    { id: 1, content: 'Hey AnDy, donne-moi les dernières news sur le PSG.', isUser: false },
    { id: 2, content: 'Le PSG a officialisé l\'arrivée de Kylian Mbappé en MLS avec l\'Inter Miami. Le transfert est évalué à 100M€. Tu veux que je creuse ?', isUser: true },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const quickSuggestions = [
    'PSG',
    'NFL',
    'Bitcoin',
    'Nvidia',
    'UFC'
  ];

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    setMessages(prev => [...prev, { id: prev.length + 1, content: inputValue, isUser: true }]);

    setTimeout(() => {
      setMessages(prev => [...prev, { id: prev.length + 1, content: `Réponse simulée à : "${inputValue}"`, isUser: false }]);
      setIsSending(false);
    }, 1500);

    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              isUser={msg.isUser}
              isThinking={false}
            />
          ))}
          {isSending && (
            <MessageBubble
              content=""
              isUser={false}
              isThinking={true}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-bg px-2 pb-4">
        <div className="flex flex-wrap gap-2 justify-center mb-3">
          {quickSuggestions.map((suggestion) => (
            <QuickSuggestion
              key={suggestion}
              text={suggestion}
              onClick={() => setInputValue(suggestion)}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Demande à AnDy..."
            className="flex-1 bg-surface text-text-primary font-mono text-sm p-3 rounded-lg border border-border resize-none focus:outline-none focus:border-border-bright min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="bg-neon text-black p-3 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Andy;