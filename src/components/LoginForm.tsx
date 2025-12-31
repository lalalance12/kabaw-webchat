import type { FormEvent } from 'react';
import kabawLogo from '../assets/logo.jpeg';

interface LoginFormProps {
  username: string;
  channel: string;
  usernameError: string | null;
  channelError: string | null;
  isLoading: boolean;
  onUsernameChange: (value: string) => void;
  onChannelChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

/**
 * Login form component for entering username and channel before connecting.
 * Displays validation errors and handles form submission.
 */
export function LoginForm({
  username,
  channel,
  usernameError,
  channelError,
  isLoading,
  onUsernameChange,
  onChannelChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Login Card */}
        <div 
          className="glass-card rounded-lg p-8 border border-surface-lighter"
          role="main"
          aria-labelledby="login-title"
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img 
              src={kabawLogo} 
              alt="Kabaw Logo" 
              className="w-20 h-20 mx-auto mb-4 rounded-lg object-contain"
            />
            <h1 id="login-title" className="text-2xl font-bold text-text">Kabaw WebChat</h1>
            <p className="text-sm text-text-muted mt-1">Real-time WebSocket messaging</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5" aria-label="Connection form">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-muted mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="Anonymous"
                autoComplete="username"
                autoFocus
                aria-invalid={!!usernameError}
                aria-describedby={usernameError ? 'username-error' : undefined}
                className={`w-full bg-surface rounded-lg px-4 py-3 text-text placeholder-text-dim
                         border ${usernameError ? 'border-error' : 'border-surface-lighter'} focus:border-accent
                         focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all duration-200`}
              />
              {usernameError && (
                <p id="username-error" className="text-xs text-error mt-1" role="alert">
                  {usernameError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="channel" className="block text-sm font-medium text-text-muted mb-2">
                Channel
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" aria-hidden="true">#</span>
                <input
                  type="text"
                  id="channel"
                  value={channel}
                  onChange={(e) => onChannelChange(e.target.value)}
                  placeholder="general"
                  aria-invalid={!!channelError}
                  aria-describedby={channelError ? 'channel-error' : undefined}
                  className={`w-full bg-surface rounded-lg pl-8 pr-4 py-3 text-text placeholder-text-dim
                           border ${channelError ? 'border-error' : 'border-surface-lighter'} focus:border-accent
                           focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all duration-200`}
                />
              </div>
              {channelError && (
                <p id="channel-error" className="text-xs text-error mt-1" role="alert">
                  {channelError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !!usernameError || !!channelError}
              aria-busy={isLoading}
              className="w-full btn-primary py-3 rounded-lg font-semibold text-white text-base mt-2
                       flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Connect</span>
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
