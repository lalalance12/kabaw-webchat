import { useState, type FormEvent, type KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-lg p-4">
      <div className="flex items-end gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Connect to start chatting...' : 'Type a message...'}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-surface-light rounded-lg px-4 py-3 text-text placeholder-text-dim
                     resize-none focus:outline-none input-focus-ring transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] max-h-32"
          style={{ overflow: 'hidden' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="btn-primary px-6 py-3 rounded-lg font-semibold text-white
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
      <p className="text-xs text-text-dim mt-2 text-center">
        Press <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-text-muted">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-text-muted">Shift+Enter</kbd> for new line
      </p>
    </form>
  );
}
