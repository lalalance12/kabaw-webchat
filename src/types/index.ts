/**
 * Message types for WebSocket communication
 */

export type MessageType = 'message' | 'system' | 'user_connected';

export interface ChatMessage {
    type: MessageType;
    username: string;
    user_id?: string;
    content: string;
    timestamp: string;
    channel: string;
}

export interface OutgoingMessage {
    type: 'message';
    content: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ConnectionInfo {
    status: ConnectionStatus;
    username: string;
    channel: string;
    userId: string | null;
    error: string | null;
}
