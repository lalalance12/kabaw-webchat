import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (content: string) => boolean;
  disabled: boolean;
}

const MAX_MESSAGE_LENGTH = 1000;

/**
 * Message input component with auto-resize textarea and character counter.
 * Input and send button are disabled when not connected to the server.
 */
export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when connected
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || disabled || isSending) return;

    setIsSending(true);
    const success = onSend(trimmedMessage);
    
    if (success) {
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
    
    setTimeout(() => setIsSending(false), 100);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
  };

  const charCount = message.length;
  const isNearLimit = charCount > MAX_MESSAGE_LENGTH * 0.9;
  const isAtLimit = charCount >= MAX_MESSAGE_LENGTH;

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-lg p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={disabled ? 'Connect to start chatting...' : 'Type a message...'}
            disabled={disabled}
            rows={1}
            className="w-full bg-surface-light rounded-lg px-4 py-3 text-text placeholder-text-dim
                       resize-none focus:outline-none transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] max-h-32
                       border border-transparent focus:border-accent focus:ring-1 focus:ring-accent/30"
            style={{ overflow: 'hidden' }}
          />
          
          {/* Character counter */}
          {charCount > 0 && !disabled && (
            <div className={`absolute bottom-1 right-2 text-xs transition-colors ${
              isAtLimit ? 'text-error' : isNearLimit ? 'text-warning' : 'text-text-dim'
            }`}>
              {charCount}/{MAX_MESSAGE_LENGTH}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || !message.trim() || isSending}
          className="btn-primary px-5 py-3 rounded-lg font-semibold text-white
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                     transition-all duration-200"
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

      {/* Keyboard hints */}
      <p className="text-xs text-text-dim mt-2 px-1">
        <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-text-muted text-[10px]">Enter</kbd>
        <span className="mx-1">send</span>
        <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-text-muted text-[10px]">Shift+Enter</kbd>
        <span className="ml-1">new line</span>
      </p>
    </form>
  );
}
