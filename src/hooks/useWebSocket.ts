import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, OutgoingMessage, ConnectionInfo, ConnectionStatus } from '../types';

const WS_BASE_URL = 'ws://localhost:8080/ws';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

interface UseWebSocketReturn {
    connectionInfo: ConnectionInfo;
    messages: ChatMessage[];
    connect: (username: string, channel: string) => void;
    disconnect: () => void;
    sendMessage: (content: string) => void;
    clearMessages: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
    const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
        status: 'disconnected',
        username: '',
        channel: 'general',
        userId: null,
        error: null,
    });
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shouldReconnectRef = useRef(false);
    const connectionParamsRef = useRef({ username: '', channel: 'general' });

    const clearReconnectTimeout = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const updateStatus = useCallback((status: ConnectionStatus, error: string | null = null) => {
        setConnectionInfo(prev => ({ ...prev, status, error }));
    }, []);

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

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log(`[FRONTEND-CONNECT] Connected to WebSocket as ${username} in channel ${channel}`);
            updateStatus('connected');
            reconnectAttemptsRef.current = 0;
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
            updateStatus('error', 'Connection error occurred');
        };

        ws.onclose = (event) => {
            console.log(`[FRONTEND-DISCONNECT] Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
            console.log('[FRONTEND-USER-ID] User ID cleared');

            setConnectionInfo(prev => ({ ...prev, userId: null }));
            wsRef.current = null;

            // Attempt reconnection if supposed to stay connected
            if (shouldReconnectRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttemptsRef.current++;
                console.log(`[FRONTEND-RECONNECT] Attempting reconnect ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_DELAY}ms`);
                updateStatus('connecting', `Reconnecting... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);

                reconnectTimeoutRef.current = setTimeout(() => {
                    connectInternal(connectionParamsRef.current.username, connectionParamsRef.current.channel);
                }, RECONNECT_DELAY);
            } else if (shouldReconnectRef.current) {
                updateStatus('error', 'Max reconnection attempts reached');
            } else {
                updateStatus('disconnected');
            }
        };
    }, [updateStatus]);

    const connect = useCallback((username: string, channel: string) => {
        clearReconnectTimeout();
        shouldReconnectRef.current = true;
        connectionParamsRef.current = { username, channel };
        reconnectAttemptsRef.current = 0;
        connectInternal(username, channel);
    }, [connectInternal, clearReconnectTimeout]);

    const disconnect = useCallback(() => {
        console.log('[FRONTEND-DISCONNECT] User initiated disconnect');
        clearReconnectTimeout();
        shouldReconnectRef.current = false;
        reconnectAttemptsRef.current = 0;

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        updateStatus('disconnected');
    }, [clearReconnectTimeout, updateStatus]);

    const sendMessage = useCallback((content: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error('[FRONTEND-ERROR] Cannot send message: WebSocket not connected');
            return;
        }

        const message: OutgoingMessage = {
            type: 'message',
            content,
        };

        console.log('[FRONTEND-SEND]', JSON.stringify(message, null, 2));
        wsRef.current.send(JSON.stringify(message));
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearReconnectTimeout();
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [clearReconnectTimeout]);

    return {
        connectionInfo,
        messages,
        connect,
        disconnect,
        sendMessage,
        clearMessages,
    };
}
