import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, OutgoingMessage, ConnectionInfo, ConnectionStatus } from '../types';

// Configuration constants - easily configurable
const WS_BASE_URL = 'ws://localhost:8080/ws';
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff
const MAX_RECONNECT_ATTEMPTS = 5;
const CONNECTION_TIMEOUT = 10000; // 10 seconds

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
        maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
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
        const index = Math.min(attempt, RECONNECT_DELAYS.length - 1);
        return RECONNECT_DELAYS[index];
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
                    console.log('[FRONTEND-SEND-QUEUED]', content);
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

        const wsUrl = `${WS_BASE_URL}?username=${encodeURIComponent(username)}&channel=${encodeURIComponent(channel)}`;
        console.log('[FRONTEND-CONNECT] Attempting to connect to:', wsUrl);

        updateStatus('connecting');
        setConnectionInfo(prev => ({ ...prev, username, channel, userId: null }));

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            // Set connection timeout
            connectionTimeoutRef.current = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.error('[FRONTEND-ERROR] Connection timeout');
                    ws.close();
                    updateStatus('error', 'Connection timeout - server may be unavailable');
                }
            }, CONNECTION_TIMEOUT);

            ws.onopen = () => {
                clearTimeout(connectionTimeoutRef.current!);
                console.log(`[FRONTEND-CONNECT] Connected to WebSocket as ${username} in channel ${channel}`);
                updateStatus('connected');
                reconnectAttemptsRef.current = 0;

                // Flush any queued messages
                flushMessageQueue();
            };

            ws.onmessage = (event) => {
                try {
                    const message: ChatMessage = JSON.parse(event.data);
                    console.log('[FRONTEND-MESSAGE]', JSON.stringify(message, null, 2));

                    // Handle user_connected message to get assigned user ID
                    if (message.type === 'user_connected' && message.user_id) {
                        console.log('[FRONTEND-USER-ID] Assigned user ID:', message.user_id);
                        setConnectionInfo(prev => ({ ...prev, userId: message.user_id! }));
                    }

                    setMessages(prev => [...prev, message]);
                } catch (err) {
                    console.error('[FRONTEND-ERROR] Failed to parse message:', err);
                }
            };

            ws.onerror = (error) => {
                console.error('[FRONTEND-ERROR] WebSocket error:', error);
                // Don't update status here - onclose will handle it
            };

            ws.onclose = (event) => {
                clearTimeout(connectionTimeoutRef.current!);
                console.log(`[FRONTEND-DISCONNECT] Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
                console.log('[FRONTEND-USER-ID] User ID cleared');

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
                if (shouldReconnectRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                    const delay = getReconnectDelay(reconnectAttemptsRef.current);
                    reconnectAttemptsRef.current++;

                    console.log(`[FRONTEND-RECONNECT] Attempting reconnect ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);
                    updateStatus('connecting', `Reconnecting in ${delay / 1000}s... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);

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
            console.error('[FRONTEND-ERROR] Failed to create WebSocket:', err);
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
        console.log('[FRONTEND-DISCONNECT] User initiated disconnect');
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
            console.log('[FRONTEND-RETRY] User initiated retry');
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
            console.warn('[FRONTEND-WARN] Cannot send empty message');
            return false;
        }

        // If connected, send immediately
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message: OutgoingMessage = {
                type: 'message',
                content: content.trim(),
            };
            console.log('[FRONTEND-SEND]', JSON.stringify(message, null, 2));
            wsRef.current.send(JSON.stringify(message));
            return true;
        }

        // If reconnecting, queue the message
        if (connectionInfo.status === 'connecting' && shouldReconnectRef.current) {
            messageQueueRef.current.push(content.trim());
            console.log('[FRONTEND-QUEUE] Message queued for sending after reconnect');
            return true;
        }

        console.error('[FRONTEND-ERROR] Cannot send message: WebSocket not connected');
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
