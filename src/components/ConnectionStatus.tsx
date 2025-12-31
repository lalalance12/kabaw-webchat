import type { ConnectionInfo } from '../types';

interface ConnectionStatusProps {
  connectionInfo: ConnectionInfo;
  onRetry?: () => void;
}

/**
 * Displays the current WebSocket connection status with visual indicators
 * Shows connection details when connected and error states with retry option
 */
export function ConnectionStatus({ connectionInfo, onRetry }: ConnectionStatusProps) {
  const { status, username, channel, userId, error, reconnectAttempt, maxReconnectAttempts } = connectionInfo;

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-accent';
      case 'connecting':
        return 'bg-warning animate-pulse';
      case 'error':
        return 'bg-error';
      default:
        return 'bg-text-dim';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        if (reconnectAttempt && reconnectAttempt > 0) {
          return `Reconnecting (${reconnectAttempt}/${maxReconnectAttempts})...`;
        }
        return 'Connecting...';
      case 'error':
        return 'Connection Failed';
      default:
        return 'Disconnected';
    }
  };

  const showRetryButton = status === 'error' && onRetry;

  return (
    <div 
      className="glass-card rounded-lg p-4 animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${getStatusText()}`}
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="relative" aria-hidden="true">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status === 'connected' ? 'animate-pulse-glow' : ''}`} />
            {status === 'connecting' && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-warning animate-ping opacity-75" />
            )}
          </div>
          <div>
            <span className="text-sm font-medium text-text">{getStatusText()}</span>
            {error && status !== 'connected' && (
              <p className="text-xs text-error mt-0.5" role="alert">{error}</p>
            )}
          </div>
        </div>

        {/* Connection details when connected */}
        {status === 'connected' && (
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-accent font-medium">{username}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span className="text-accent font-medium">{channel}</span>
            </div>
            {userId && (
              <div className="hidden md:flex items-center gap-2">
                <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="text-text-muted font-mono text-xs">{userId.slice(0, 8)}...</span>
              </div>
            )}
          </div>
        )}

        {/* Retry button for error state */}
        {showRetryButton && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 
                     text-accent transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Connection
          </button>
        )}

        {/* Reconnecting progress indicator */}
        {status === 'connecting' && reconnectAttempt && reconnectAttempt > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: maxReconnectAttempts || 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < (reconnectAttempt || 0) ? 'bg-warning' : 'bg-surface-lighter'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
