interface ErrorScreenProps {
  errorMessage: string | null;
  onRetry: () => void;
  onBack: () => void;
}

/**
 * Error screen displayed when WebSocket connection fails.
 * Provides retry and back to login options.
 */
export function ErrorScreen({ errorMessage, onRetry, onBack }: ErrorScreenProps) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div 
          className="glass-card rounded-lg p-8 border border-error/30 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-error" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Connection Failed</h2>
          <p className="text-text-muted mb-6">
            {errorMessage || 'Unable to connect to the WebSocket server. Please check if the server is running.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onRetry}
              className="btn-primary px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2"
              aria-label="Retry connection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Try Again
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg bg-surface-light hover:bg-surface-lighter text-text-muted transition-colors"
              aria-label="Go back to login"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
