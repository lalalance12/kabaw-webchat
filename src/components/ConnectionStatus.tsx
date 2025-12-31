import type { ConnectionInfo } from '../types';

interface ConnectionStatusProps {
  connectionInfo: ConnectionInfo;
}

export function ConnectionStatus({ connectionInfo }: ConnectionStatusProps) {
  const { status, username, channel, userId, error } = connectionInfo;

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
        return error || 'Connecting...';
      case 'error':
        return error || 'Error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="glass-card rounded-lg p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status === 'connected' ? 'animate-pulse-glow' : ''}`} />
          <span className="text-sm font-medium text-text">{getStatusText()}</span>
        </div>

        {/* Connection details when connected */}
        {status === 'connected' && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text-dim">User:</span>
              <span className="text-accent font-medium">{username}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-dim">Channel:</span>
              <span className="text-accent font-medium">#{channel}</span>
            </div>
            {userId && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-text-dim">ID:</span>
                <span className="text-text-muted font-mono text-xs">{userId.slice(0, 8)}...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
