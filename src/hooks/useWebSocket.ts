import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, OutgoingMessage, ConnectionInfo, ConnectionStatus } from '../types';
import { WS_CONFIG } from '../config/constants';
import { wsLogger } from '../utils/logger';

/**
 * Custom hook for WebSocket connection management
 * Handles connection state, auto-reconnection with exponential backoff,
 * message queuing, and connection health monitoring.
 */
interface UseWebSocketReturn {
    connectionInfo: ConnectionInfo;
    messages: ChatMessage[];
    connect: (username: string, channel: string) => void;
    disconnect: () => void;
    sendMessage: (content: string) => boolean;
    clearMessages: () => void;
    retryConnection: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
    const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
        status: 'disconnected',
        username: '',
        channel: 'general',
        userId: null,
        error: null,
        reconnectAttempt: 0,
        maxReconnectAttempts: WS_CONFIG.MAX_RECONNECT_ATTEMPTS,
    });
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Refs for mutable values that shouldn't trigger re-renders
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shouldReconnectRef = useRef(false);
    const connectionParamsRef = useRef({ username: '', channel: 'general' });
    const messageQueueRef = useRef<string[]>([]); // Queue messages while reconnecting

    /**
     * Clear all pending timeouts
     */
    const clearTimeouts = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
        }
    }, []);

    /**
     * Update connection status with optional error message
     */
    const updateStatus = useCallback((status: ConnectionStatus, error: string | null = null) => {
        setConnectionInfo(prev => ({
            ...prev,
            status,
            error,
            reconnectAttempt: reconnectAttemptsRef.current,
        }));
    }, []);

    /**
     * Get reconnection delay with exponential backoff
     */
    const getReconnectDelay = useCallback((attempt: number): number => {
        const index = Math.min(attempt, WS_CONFIG.RECONNECT_DELAYS.length - 1);
        return WS_CONFIG.RECONNECT_DELAYS[index];
    }, []);

    /**
     * Flush queued messages after reconnection
     */
    const flushMessageQueue = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            while (messageQueueRef.current.length > 0) {
                const content = messageQueueRef.current.shift();
                if (content) {
                    const message: OutgoingMessage = { type: 'message', content };
                    wsRef.current.send(JSON.stringify(message));
                    wsLogger.log('Sent queued message:', content);
                }
            }
        }
    }, []);

    /**
     * Internal connection logic with timeout handling
     */
    const connectInternal = useCallback((username: string, channel: string) => {
        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        const wsUrl = `${WS_CONFIG.BASE_URL}?username=${encodeURIComponent(username)}&channel=${encodeURIComponent(channel)}`;
        wsLogger.log('Attempting to connect to:', wsUrl);

        updateStatus('connecting');
        setConnectionInfo(prev => ({ ...prev, username, channel, userId: null }));

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            // Set connection timeout
            connectionTimeoutRef.current = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    wsLogger.error('Connection timeout');
                    ws.close();
                    updateStatus('error', 'Connection timeout - server may be unavailable');
                }
            }, WS_CONFIG.CONNECTION_TIMEOUT);

            ws.onopen = () => {
                clearTimeout(connectionTimeoutRef.current!);
                wsLogger.log(`Connected to WebSocket as ${username} in channel ${channel}`);
                updateStatus('connected');
                reconnectAttemptsRef.current = 0;

                // Flush any queued messages
                flushMessageQueue();
            };

            ws.onmessage = (event) => {
                try {
                    const message: ChatMessage = JSON.parse(event.data);
                    wsLogger.log('Received message:', message);

                    // Handle user_connected message to get assigned user ID
                    if (message.type === 'user_connected' && message.user_id) {
                        wsLogger.log('Assigned user ID:', message.user_id);
                        setConnectionInfo(prev => ({ ...prev, userId: message.user_id! }));
                    }

                    setMessages(prev => [...prev, message]);
                } catch (err) {
                    wsLogger.error('Failed to parse message:', err);
                }
            };

            ws.onerror = (error) => {
                wsLogger.error('WebSocket error:', error);
                // Don't update status here - onclose will handle it
            };

            ws.onclose = (event) => {
                clearTimeout(connectionTimeoutRef.current!);
                wsLogger.log(`Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
                wsLogger.log('User ID cleared');

                setConnectionInfo(prev => ({ ...prev, userId: null }));
                wsRef.current = null;

                // Determine close reason for user-friendly message
                let errorMessage = null;
                if (event.code === 1006) {
                    errorMessage = 'Connection lost unexpectedly';
                } else if (event.code === 1001) {
                    errorMessage = 'Server is going away';
                } else if (event.code !== 1000 && event.code !== 1005) {
                    errorMessage = `Connection closed (code: ${event.code})`;
                }

                // Attempt reconnection if supposed to stay connected
                if (shouldReconnectRef.current && reconnectAttemptsRef.current < WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
                    const delay = getReconnectDelay(reconnectAttemptsRef.current);
                    reconnectAttemptsRef.current++;

                    wsLogger.log(`Attempting reconnect ${reconnectAttemptsRef.current}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);
                    updateStatus('connecting', `Reconnecting in ${delay / 1000}s... (${reconnectAttemptsRef.current}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectInternal(connectionParamsRef.current.username, connectionParamsRef.current.channel);
                    }, delay);
                } else if (shouldReconnectRef.current) {
                    updateStatus('error', 'Unable to connect. Please check if the server is running.');
                } else {
                    updateStatus('disconnected', errorMessage);
                }
            };
        } catch (err) {
            wsLogger.error('Failed to create WebSocket:', err);
            updateStatus('error', 'Failed to initialize connection');
        }
    }, [updateStatus, getReconnectDelay, flushMessageQueue]);

    /**
     * Public connect method
     */
    const connect = useCallback((username: string, channel: string) => {
        clearTimeouts();
        shouldReconnectRef.current = true;
        connectionParamsRef.current = { username, channel };
        reconnectAttemptsRef.current = 0;
        messageQueueRef.current = []; // Clear message queue on new connection
        connectInternal(username, channel);
    }, [connectInternal, clearTimeouts]);

    /**
     * Public disconnect method
     */
    const disconnect = useCallback(() => {
        wsLogger.log('User initiated disconnect');
        clearTimeouts();
        shouldReconnectRef.current = false;
        reconnectAttemptsRef.current = 0;
        messageQueueRef.current = [];

        if (wsRef.current) {
            wsRef.current.close(1000, 'User disconnected');
            wsRef.current = null;
        }

        updateStatus('disconnected');
    }, [clearTimeouts, updateStatus]);

    /**
     * Retry connection after failure
     */
    const retryConnection = useCallback(() => {
        if (connectionInfo.status === 'error' || connectionInfo.status === 'disconnected') {
            wsLogger.log('User initiated retry');
            reconnectAttemptsRef.current = 0;
            shouldReconnectRef.current = true;
            connectInternal(
                connectionParamsRef.current.username || 'Anonymous',
                connectionParamsRef.current.channel || 'general'
            );
        }
    }, [connectionInfo.status, connectInternal]);

    /**
     * Send message with queue support during reconnection
     * Returns true if message was sent/queued successfully
     */
    const sendMessage = useCallback((content: string): boolean => {
        if (!content.trim()) {
            wsLogger.warn('Cannot send empty message');
            return false;
        }

        // If connected, send immediately
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message: OutgoingMessage = {
                type: 'message',
                content: content.trim(),
            };
            wsLogger.log('Sent message:', message);
            wsRef.current.send(JSON.stringify(message));
            return true;
        }

        // If reconnecting, queue the message
        if (connectionInfo.status === 'connecting' && shouldReconnectRef.current) {
            messageQueueRef.current.push(content.trim());
            wsLogger.log('Message queued for sending after reconnect');
            return true;
        }

        wsLogger.error('Cannot send message: WebSocket not connected');
        return false;
    }, [connectionInfo.status]);

    /**
     * Clear all messages
     */
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimeouts();
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
            }
        };
    }, [clearTimeouts]);

    return {
        connectionInfo,
        messages,
        connect,
        disconnect,
        sendMessage,
        clearMessages,
        retryConnection,
    };
}
