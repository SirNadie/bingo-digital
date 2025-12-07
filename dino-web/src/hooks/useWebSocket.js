import { useEffect, useRef, useCallback, useState } from 'react';
export function useWebSocket({ url, onMessage, onOpen, onClose, onError, reconnectAttempts = 5, reconnectInterval = 3000, enabled = true, }) {
    const wsRef = useRef(null);
    const reconnectCountRef = useRef(0);
    const reconnectTimeoutRef = useRef();
    const mountedRef = useRef(true);
    // Use refs for callbacks to avoid re-connection on callback changes
    const onMessageRef = useRef(onMessage);
    const onOpenRef = useRef(onOpen);
    const onCloseRef = useRef(onClose);
    const onErrorRef = useRef(onError);
    // Keep refs updated
    useEffect(() => {
        onMessageRef.current = onMessage;
        onOpenRef.current = onOpen;
        onCloseRef.current = onClose;
        onErrorRef.current = onError;
    }, [onMessage, onOpen, onClose, onError]);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const connect = useCallback(() => {
        if (!mountedRef.current || !enabled)
            return;
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING)
            return;
        setIsConnecting(true);
        try {
            const ws = new WebSocket(url);
            ws.onopen = () => {
                if (!mountedRef.current) {
                    ws.close();
                    return;
                }
                setIsConnected(true);
                setIsConnecting(false);
                reconnectCountRef.current = 0;
                onOpenRef.current?.();
            };
            ws.onclose = () => {
                if (!mountedRef.current)
                    return;
                setIsConnected(false);
                setIsConnecting(false);
                onCloseRef.current?.();
                // Attempt to reconnect only if still mounted and enabled
                if (mountedRef.current && enabled && reconnectCountRef.current < reconnectAttempts) {
                    reconnectCountRef.current++;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (mountedRef.current) {
                            connect();
                        }
                    }, reconnectInterval);
                }
            };
            ws.onerror = (error) => {
                if (!mountedRef.current)
                    return;
                setIsConnecting(false);
                onErrorRef.current?.(error);
            };
            ws.onmessage = (event) => {
                if (!mountedRef.current)
                    return;
                try {
                    const data = JSON.parse(event.data);
                    onMessageRef.current?.(data);
                }
                catch {
                    console.error('Failed to parse WebSocket message:', event.data);
                }
            };
            wsRef.current = ws;
        }
        catch (error) {
            setIsConnecting(false);
            console.error('WebSocket connection error:', error);
        }
    }, [url, enabled, reconnectAttempts, reconnectInterval]);
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectCountRef.current = reconnectAttempts; // Prevent reconnection
        if (wsRef.current) {
            wsRef.current.onclose = null; // Prevent onclose handler
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
        setIsConnecting(false);
    }, [reconnectAttempts]);
    const send = useCallback((data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    }, []);
    const reconnect = useCallback(() => {
        disconnect();
        reconnectCountRef.current = 0;
        setTimeout(connect, 100);
    }, [connect, disconnect]);
    useEffect(() => {
        mountedRef.current = true;
        if (enabled) {
            connect();
        }
        return () => {
            mountedRef.current = false;
            disconnect();
        };
    }, [url, enabled]); // Only reconnect when URL or enabled changes
    return {
        isConnected,
        isConnecting,
        send,
        disconnect,
        reconnect,
    };
}
