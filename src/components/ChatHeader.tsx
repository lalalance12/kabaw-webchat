import kabawLogo from '../assets/logo.jpeg';

interface ChatHeaderProps {
  isConnected: boolean;
  onClearMessages: () => void;
  onDisconnect: () => void;
}

/**
 * Chat header component displaying logo, title, and connection controls.
 */
export function ChatHeader({ isConnected, onClearMessages, onDisconnect }: ChatHeaderProps) {
  return (
    <header 
      className="glass-card rounded-lg p-4 flex items-center justify-between animate-fade-in"
      role="banner"
    >
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
      <nav className="flex items-center gap-2" aria-label="Chat controls">
        {isConnected && (
          <>
            <button
              onClick={onClearMessages}
              className="px-3 py-2 rounded-lg bg-surface-light hover:bg-surface-lighter
                       text-text-muted hover:text-text transition-colors text-sm flex items-center gap-1"
              title="Clear all messages"
              aria-label="Clear all messages"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                />
              </svg>
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={onDisconnect}
              className="px-4 py-2 rounded-lg bg-error/20 hover:bg-error/30
                       text-error transition-colors text-sm font-medium flex items-center gap-1"
              aria-label="Disconnect from chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
