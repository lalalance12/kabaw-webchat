import { useState, type FormEvent, useEffect, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ConnectionStatus } from './ConnectionStatus';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { LoginForm } from './LoginForm';
import { ErrorScreen } from './ErrorScreen';
import { ChatHeader } from './ChatHeader';
import { 
  validateUsername, 
  validateChannel, 
  sanitizeUsername, 
  sanitizeChannel 
} from '../utils/validation';
import { UI_CONFIG } from '../config/constants';

/**
 * Main chat container component that orchestrates the entire chat experience.
 * Handles login flow, connection management, and message display.
 */
export function ChatContainer() {
  const { 
    connectionInfo, 
    messages, 
    connect, 
    disconnect, 
    sendMessage, 
    clearMessages,
    retryConnection 
  } = useWebSocket();
  
  const [username, setUsername] = useState('');
  const [channel, setChannel] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [channelError, setChannelError] = useState<string | null>(null);

  const isConnected = connectionInfo.status === 'connected';
  const isConnecting = connectionInfo.status === 'connecting';
  const isError = connectionInfo.status === 'error';
  const showLoginScreen = !isConnected && !isConnecting && !isError;

  // Validate inputs on change
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const validation = validateUsername(value);
    setUsernameError(validation.error || null);
  };

  const handleChannelChange = (value: string) => {
    setChannel(value);
    const validation = validateChannel(value);
    setChannelError(validation.error || null);
  };

  const handleConnect = useCallback((e: FormEvent) => {
    e.preventDefault();
    
    // Validate before connecting
    const usernameValidation = validateUsername(username);
    const channelValidation = validateChannel(channel);
    
    if (!usernameValidation.isValid || !channelValidation.isValid) {
      setUsernameError(usernameValidation.error || null);
      setChannelError(channelValidation.error || null);
      return;
    }
    
    setIsLoading(true);
    const sanitizedUsername = sanitizeUsername(username) || 'Anonymous';
    const sanitizedChannel = sanitizeChannel(channel) || 'general';
    connect(sanitizedUsername, sanitizedChannel);
    
    // Reset loading after a brief delay
    setTimeout(() => setIsLoading(false), UI_CONFIG.LOADING_RESET_DELAY);
  }, [username, channel, connect]);

  // Handle keyboard shortcut for quick connect (Ctrl/Cmd + Enter on login)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && showLoginScreen) {
        handleConnect(new Event('submit') as unknown as FormEvent);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLoginScreen, handleConnect]);

  const handleDisconnect = () => {
    disconnect();
  };

  const handleRetry = () => {
    retryConnection();
  };

  // Login screen - using extracted component
  if (showLoginScreen) {
    return (
      <LoginForm
        username={username}
        channel={channel}
        usernameError={usernameError}
        channelError={channelError}
        isLoading={isLoading}
        onUsernameChange={handleUsernameChange}
        onChannelChange={handleChannelChange}
        onSubmit={handleConnect}
      />
    );
  }

  // Error state - using extracted component
  if (isError) {
    return (
      <ErrorScreen
        errorMessage={connectionInfo.error}
        onRetry={handleRetry}
        onBack={handleDisconnect}
      />
    );
  }

  // Chat screen - full layout
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 gap-4">
      {/* Header - using extracted component */}
      <ChatHeader
        isConnected={isConnected}
        onClearMessages={clearMessages}
        onDisconnect={handleDisconnect}
      />

      {/* Connection status */}
      <ConnectionStatus connectionInfo={connectionInfo} onRetry={handleRetry} />

      {/* Messages area */}
      <div 
        className="flex-1 glass-card rounded-lg overflow-hidden flex flex-col animate-fade-in min-h-0"
        role="main"
        aria-label="Chat messages area"
      >
        <MessageList messages={messages} currentUserId={connectionInfo.userId} />
      </div>

      {/* Message input */}
      <MessageInput 
        onSend={sendMessage} 
        disabled={!isConnected} 
      />
    </div>
  );
}
