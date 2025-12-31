import { useState, type FormEvent, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ConnectionStatus } from './ConnectionStatus';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import kabawLogo from '../assets/logo.jpeg';

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

  const isConnected = connectionInfo.status === 'connected';
  const isConnecting = connectionInfo.status === 'connecting';
  const isError = connectionInfo.status === 'error';
  const showLoginScreen = !isConnected && !isConnecting && !isError;

  // Handle keyboard shortcut for quick connect (Ctrl/Cmd + Enter on login)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && showLoginScreen) {
        handleConnect(new Event('submit') as unknown as FormEvent);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLoginScreen, username, channel]);

  const handleConnect = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const trimmedUsername = username.trim() || 'Anonymous';
    const trimmedChannel = channel.trim() || 'general';
    connect(trimmedUsername, trimmedChannel);
    
    // Reset loading after a brief delay
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleRetry = () => {
    retryConnection();
  };

  // Login screen - centered card design
  if (showLoginScreen) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Login Card */}
          <div className="glass-card rounded-lg p-8 border border-surface-lighter">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <img 
                src={kabawLogo} 
                alt="Kabaw Logo" 
                className="w-20 h-20 mx-auto mb-4 rounded-lg object-contain"
              />
              <h1 className="text-2xl font-bold text-text">Kabaw WebChat</h1>
              <p className="text-sm text-text-muted mt-1">Real-time WebSocket messaging</p>
            </div>

            {/* Form */}
            <form onSubmit={handleConnect} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-muted mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Anonymous"
                  autoComplete="username"
                  autoFocus
                  className="w-full bg-surface rounded-lg px-4 py-3 text-text placeholder-text-dim
                           border border-surface-lighter focus:border-accent
                           focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="channel" className="block text-sm font-medium text-text-muted mb-2">
                  Channel
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim">#</span>
                  <input
                    type="text"
                    id="channel"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    placeholder="general"
                    className="w-full bg-surface rounded-lg pl-8 pr-4 py-3 text-text placeholder-text-dim
                             border border-surface-lighter focus:border-accent
                             focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 rounded-lg font-semibold text-white text-base mt-2
                         flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect
                  </>
                )}
              </button>
            </form>

            {/* Footer info */}
            <div className="mt-6 pt-6 border-t border-surface-lighter">
              <p className="text-xs text-text-dim text-center">
                Connecting to{' '}
                <code className="px-1.5 py-0.5 bg-surface rounded text-text-muted">ws://localhost:8080</code>
              </p>
              <p className="text-xs text-text-dim text-center mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-surface rounded text-text-muted">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-surface rounded text-text-muted">Enter</kbd> to quick connect
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (isError) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-card rounded-lg p-8 border border-error/30 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text mb-2">Connection Failed</h2>
            <p className="text-text-muted mb-6">
              {connectionInfo.error || 'Unable to connect to the WebSocket server. Please check if the server is running.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="btn-primary px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              <button
                onClick={handleDisconnect}
                className="px-6 py-3 rounded-lg bg-surface-light hover:bg-surface-lighter text-text-muted transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat screen - full layout
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 gap-4">
      {/* Header */}
      <header className="glass-card rounded-lg p-4 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <img 
            src={kabawLogo} 
            alt="Kabaw Logo" 
            className="w-10 h-10 rounded-lg object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-text">Kabaw WebChat</h1>
            <p className="text-xs text-text-muted">Real-time WebSocket messaging</p>
          </div>
        </div>

        {/* Connection controls */}
        <div className="flex items-center gap-2">
          {isConnected && (
            <>
              <button
                onClick={clearMessages}
                className="px-3 py-2 rounded-lg bg-surface-light hover:bg-surface-lighter
                         text-text-muted hover:text-text transition-colors text-sm flex items-center gap-1"
                title="Clear all messages"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Clear</span>
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-lg bg-error/20 hover:bg-error/30
                         text-error transition-colors text-sm font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Connection status */}
      <ConnectionStatus connectionInfo={connectionInfo} onRetry={handleRetry} />

      {/* Messages area */}
      <div className="flex-1 glass-card rounded-lg overflow-hidden flex flex-col animate-fade-in min-h-0">
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
