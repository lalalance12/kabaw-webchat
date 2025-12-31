/**
 * Development-only logging utility
 * Logs are disabled in production builds to prevent console pollution
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface Logger {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    group: (label: string) => void;
    groupEnd: () => void;
}

/**
 * Create a prefixed logger for a specific module
 * @param prefix - The prefix to add to all log messages (e.g., "WEBSOCKET", "UI")
 */
export function createLogger(prefix: string): Logger {
    const formatPrefix = (level: LogLevel): string => {
        return `[${prefix}] [${level.toUpperCase()}]`;
    };

    return {
        log: (...args: unknown[]) => {
            if (isDev) console.log(formatPrefix('log'), ...args);
        },
        warn: (...args: unknown[]) => {
            if (isDev) console.warn(formatPrefix('warn'), ...args);
        },
        error: (...args: unknown[]) => {
            // Always log errors, even in production
            console.error(formatPrefix('error'), ...args);
        },
        info: (...args: unknown[]) => {
            if (isDev) console.info(formatPrefix('info'), ...args);
        },
        debug: (...args: unknown[]) => {
            if (isDev) console.debug(formatPrefix('debug'), ...args);
        },
        group: (label: string) => {
            if (isDev) console.group(`[${prefix}] ${label}`);
        },
        groupEnd: () => {
            if (isDev) console.groupEnd();
        },
    };
}

// Pre-configured loggers for common modules
export const wsLogger = createLogger('FRONTEND-WS');
export const uiLogger = createLogger('FRONTEND-UI');
