import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string | null;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getMessageStyle = (message: ChatMessage) => {
    if (message.type === 'system' || message.type === 'user_connected') {
      return 'message-system';
    }
    if (message.user_id && message.user_id === currentUserId) {
      return 'message-own';
    }
    return 'message-other';
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.user_id && message.user_id === currentUserId;
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-text-muted">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-lg">No messages yet</p>
          <p className="text-sm text-text-dim mt-2">Messages will appear here in real-time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message, index) => (
        <div
          key={`${message.timestamp}-${index}`}
          className={`animate-slide-up ${isOwnMessage(message) ? 'flex justify-end' : ''}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${getMessageStyle(message)} ${
              isOwnMessage(message) ? 'rounded-br-sm' : 'rounded-bl-sm'
            }`}
          >
            {/* Message header */}
            {!isOwnMessage(message) && (
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-semibold text-sm ${
                    message.type === 'system' || message.type === 'user_connected'
                      ? 'text-system-message'
                      : 'text-accent'
                  }`}
                >
                  {message.username}
                </span>
                {message.user_id && (
                  <span className="text-xs text-text-dim font-mono">
                    {message.user_id.slice(0, 6)}
                  </span>
                )}
              </div>
            )}

            {/* Message content */}
            <p className="text-text break-words">{message.content}</p>

            {/* Timestamp */}
            <div className={`text-xs text-text-dim mt-1 ${isOwnMessage(message) ? 'text-right' : ''}`}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
