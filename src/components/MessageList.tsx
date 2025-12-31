import { useEffect, useRef, useMemo } from 'react';
import type { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string | null;
}

/**
 * Format timestamp to relative time (e.g., "just now", "2 min ago")
 */
function formatRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

/**
 * Format timestamp to full time display
 */
function formatFullTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/**
 * Get initials from username for avatar
 */
function getInitials(username: string): string {
  return username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate consistent color from username
 */
function getUserColor(username: string): string {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-orange-500 to-orange-600',
    'from-cyan-500 to-cyan-600',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Displays chat messages with auto-scroll, message grouping, and visual differentiation
 */
export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Group consecutive messages from same user
  const groupedMessages = useMemo(() => {
    const groups: { message: ChatMessage; isFirstInGroup: boolean; isLastInGroup: boolean }[] = [];
    
    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];
      const nextMessage = messages[index + 1];
      
      const isFirstInGroup = !prevMessage || 
        prevMessage.username !== message.username ||
        prevMessage.type !== message.type;
      
      const isLastInGroup = !nextMessage || 
        nextMessage.username !== message.username ||
        nextMessage.type !== message.type;
      
      groups.push({ message, isFirstInGroup, isLastInGroup });
    });
    
    return groups;
  }, [messages]);

  const getMessageStyle = (message: ChatMessage, isOwn: boolean) => {
    if (message.type === 'system' || message.type === 'user_connected') {
      return 'message-system';
    }
    return isOwn ? 'message-own' : 'message-other';
  };

  const isOwnMessage = (message: ChatMessage): boolean => {
    return Boolean(message.user_id && message.user_id === currentUserId);
  };

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-light flex items-center justify-center">
            <svg className="w-10 h-10 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text mb-1">No messages yet</h3>
          <p className="text-sm text-text-dim max-w-xs">
            Messages will appear here in real-time as they're received from the server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
      {groupedMessages.map(({ message, isFirstInGroup, isLastInGroup }, index) => {
        const isOwn = isOwnMessage(message);
        const isSystem = message.type === 'system' || message.type === 'user_connected';

        // System messages - centered
        if (isSystem) {
          return (
            <div key={`${message.timestamp}-${index}`} className="flex justify-center my-3 animate-slide-up">
              <div className="message-system px-4 py-2 rounded-full text-sm">
                <span className="text-system-message font-medium">{message.username}</span>
                <span className="text-text-muted mx-2">•</span>
                <span className="text-text">{message.content}</span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={`${message.timestamp}-${index}`}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-3' : 'mt-0.5'} animate-slide-up`}
          >
            <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
              {/* Avatar - only show for first message in group */}
              {!isOwn && isFirstInGroup && (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getUserColor(message.username)} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-semibold text-white">{getInitials(message.username)}</span>
                </div>
              )}
              {!isOwn && !isFirstInGroup && <div className="w-8" />}

              {/* Message bubble */}
              <div className="flex flex-col">
                {/* Username - only show for first message in group */}
                {!isOwn && isFirstInGroup && (
                  <span className="text-xs font-medium text-accent mb-1 ml-1">{message.username}</span>
                )}

                <div
                  className={`px-4 py-2 ${getMessageStyle(message, isOwn)} ${
                    isFirstInGroup && isLastInGroup
                      ? 'rounded-2xl'
                      : isFirstInGroup
                      ? isOwn ? 'rounded-2xl rounded-br-lg' : 'rounded-2xl rounded-bl-lg'
                      : isLastInGroup
                      ? isOwn ? 'rounded-2xl rounded-tr-lg' : 'rounded-2xl rounded-tl-lg'
                      : isOwn ? 'rounded-l-2xl rounded-r-lg' : 'rounded-r-2xl rounded-l-lg'
                  }`}
                >
                  <p className="text-text break-words whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Timestamp - only show for last message in group */}
                {isLastInGroup && (
                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end mr-1' : 'ml-1'}`}>
                    <span className="text-[10px] text-text-dim" title={formatFullTime(message.timestamp)}>
                      {formatRelativeTime(message.timestamp)}
                    </span>
                    {isOwn && (
                      <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
