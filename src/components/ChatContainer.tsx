import { useState, type FormEvent } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ConnectionStatus } from './ConnectionStatus';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import kabawLogo from '../assets/logo.jpeg';

export function ChatContainer() {
  const { connectionInfo, messages, connect, disconnect, sendMessage, clearMessages } = useWebSocket();
  const [username, setUsername] = useState('');
  const [channel, setChannel] = useState('general');

  const isConnected = connectionInfo.status === 'connected';
  const isConnecting = connectionInfo.status === 'connecting';
  const showLoginScreen = !isConnected && !isConnecting;

  const handleConnect = (e: FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim() || 'Anonymous';
    const trimmedChannel = channel.trim() || 'general';
    connect(trimmedUsername, trimmedChannel);
  };

  const handleDisconnect = () => {
    disconnect();
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
                  className="w-full bg-surface rounded-lg px-4 py-3 text-text placeholder-text-dim
                           border border-surface-lighter focus:border-accent
                           focus:outline-none transition-colors duration-200"
                />
              </div>

              <div>
                <label htmlFor="channel" className="block text-sm font-medium text-text-muted mb-2">
                  Channel
                </label>
                <input
                  type="text"
                  id="channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  placeholder="general"
                  className="w-full bg-surface rounded-lg px-4 py-3 text-text placeholder-text-dim
                           border border-surface-lighter focus:border-accent
                           focus:outline-none transition-colors duration-200"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 rounded-lg font-semibold text-white text-base mt-2"
              >
                Connect
              </button>
            </form>

            {/* Footer info */}
            <p className="text-xs text-text-dim mt-6 text-center">
              Connecting to <code className="px-1.5 py-0.5 bg-surface rounded text-text-muted">ws://localhost:8080</code>
            </p>
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
                         text-text-muted hover:text-text transition-colors text-sm"
              >
                Clear
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-lg bg-error/20 hover:bg-error/30
                         text-error transition-colors text-sm font-medium"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </header>

      {/* Connection status */}
      <ConnectionStatus connectionInfo={connectionInfo} />

      {/* Messages area */}
      <div className="flex-1 glass-card rounded-lg overflow-hidden flex flex-col animate-fade-in">
        <MessageList messages={messages} currentUserId={connectionInfo.userId} />
      </div>

      {/* Message input */}
      {isConnected && (
        <MessageInput onSend={sendMessage} disabled={!isConnected} />
      )}
    </div>
  );
}
