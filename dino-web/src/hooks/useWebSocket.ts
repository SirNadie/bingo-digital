import { useEffect, useRef, useCallback, useState } from 'react';

type WebSocketMessage = {
    type: string;
    payload: unknown;
};

type UseWebSocketOptions = {
    url: string;
    onMessage?: (data: WebSocketMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    reconnectAttempts?: number;
    reconnectInterval?: number;
    enabled?: boolean;
};

type UseWebSocketReturn = {
    isConnected: boolean;
    isConnecting: boolean;
    send: (data: WebSocketMessage) => void;
    disconnect: () => void;
    reconnect: () => void;
};

export function useWebSocket({
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    enabled = true,
}: UseWebSocketOptions): UseWebSocketReturn {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectCountRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const connect = useCallback(() => {
        if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

        setIsConnecting(true);

        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                setIsConnected(true);
                setIsConnecting(false);
                reconnectCountRef.current = 0;
                onOpen?.();
            };

            ws.onclose = () => {
                setIsConnected(false);
                setIsConnecting(false);
                onClose?.();

                // Attempt to reconnect
                if (enabled && reconnectCountRef.current < reconnectAttempts) {
                    reconnectCountRef.current++;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                }
            };

            ws.onerror = (error) => {
                setIsConnecting(false);
                onError?.(error);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as WebSocketMessage;
                    onMessage?.(data);
                } catch {
                    console.error('Failed to parse WebSocket message:', event.data);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            setIsConnecting(false);
            console.error('WebSocket connection error:', error);
        }
    }, [url, enabled, onOpen, onClose, onError, onMessage, reconnectAttempts, reconnectInterval]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectCountRef.current = reconnectAttempts; // Prevent reconnection
        wsRef.current?.close();
        wsRef.current = null;
        setIsConnected(false);
    }, [reconnectAttempts]);

    const send = useCallback((data: WebSocketMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not connected');
        }
    }, []);

    const reconnect = useCallback(() => {
        disconnect();
        reconnectCountRef.current = 0;
        setTimeout(connect, 100);
    }, [connect, disconnect]);

    useEffect(() => {
        if (enabled) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [enabled, connect, disconnect]);

    return {
        isConnected,
        isConnecting,
        send,
        disconnect,
        reconnect,
    };
}
