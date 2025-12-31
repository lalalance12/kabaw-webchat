/**
 * Application configuration constants
 * Centralized location for all magic numbers and configuration values
 */

// WebSocket Configuration
export const WS_CONFIG = {
    /** Base WebSocket URL - uses environment variable or defaults to localhost */
    BASE_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
    /** Exponential backoff delays for reconnection attempts (in ms) */
    RECONNECT_DELAYS: [1000, 2000, 4000, 8000, 16000] as const,
    /** Maximum number of reconnection attempts before giving up */
    MAX_RECONNECT_ATTEMPTS: 5,
    /** Timeout for initial connection attempt (in ms) */
    CONNECTION_TIMEOUT: 10000,
} as const;

// Message Configuration
export const MESSAGE_CONFIG = {
    /** Maximum character length for a single message */
    MAX_LENGTH: 1000,
} as const;

// Input Validation Configuration
export const VALIDATION_CONFIG = {
    /** Maximum username length */
    MAX_USERNAME_LENGTH: 32,
    /** Maximum channel name length */
    MAX_CHANNEL_LENGTH: 32,
    /** Pattern for valid characters (alphanumeric, underscore, dash, space) */
    ALLOWED_CHARS_PATTERN: /^[a-zA-Z0-9_\- ]*$/,
    /** Characters to strip from input for sanitization */
    DANGEROUS_CHARS_PATTERN: /[<>"'&]/g,
} as const;

// UI Configuration
export const UI_CONFIG = {
    /** Delay before resetting loading state (in ms) */
    LOADING_RESET_DELAY: 500,
    /** Delay before resetting sending state (in ms) */
    SENDING_RESET_DELAY: 100,
} as const;
