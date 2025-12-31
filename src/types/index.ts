/**
 * Type definitions for WebSocket messaging
 * Defines the structure of messages and connection states
 */

/** Types of messages supported by the WebSocket server */
export type MessageType = 'message' | 'system' | 'user_connected';

/** Incoming message from the WebSocket server */
export interface ChatMessage {
    type: MessageType;
    username: string;
    user_id?: string;
    content: string;
    timestamp: string;
    channel: string;
}

/** Outgoing message to the WebSocket server */
export interface OutgoingMessage {
    type: 'message';
    content: string;
}

/** WebSocket connection states */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/** Complete connection information including reconnection state */
export interface ConnectionInfo {
    status: ConnectionStatus;
    username: string;
    channel: string;
    userId: string | null;
    error: string | null;
    reconnectAttempt?: number;
    maxReconnectAttempts?: number;
}

/** Utility type for message grouping by date */
export interface MessageGroup {
    date: string;
    messages: ChatMessage[];
}
