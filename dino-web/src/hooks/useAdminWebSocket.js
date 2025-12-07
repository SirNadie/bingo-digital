import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminQueryKeys } from './useAdmin';
export function useAdminWebSocket() {
    const queryClient = useQueryClient();
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const [connectionState, setConnectionState] = useState('disconnected');
    const connect = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setConnectionState('error');
            return;
        }
        // Build WebSocket URL
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '');
        const wsUrl = `${wsProtocol}//${wsHost}/ws/admin?token=${token}`;
        setConnectionState('connecting');
        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            ws.onopen = () => {
                setConnectionState('connected');
                setConnectionState('connected');
            };
            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    handleEvent(message);
                }
                catch (err) {
                    // parse error silently
                }
            };
            ws.onclose = (event) => {
                setConnectionState('disconnected');
                setConnectionState('disconnected');
                // Reconnect after 5 seconds unless closed intentionally
                if (event.code !== 1000) {
                    reconnectTimeoutRef.current = window.setTimeout(() => {
                        connect();
                    }, 5000);
                }
            };
            ws.onerror = (error) => {
                setConnectionState('error');
                setConnectionState('error');
            };
        }
        catch (err) {
            setConnectionState('error');
            setConnectionState('error');
        }
    }, []);
    const handleEvent = useCallback((event) => {
        switch (event.type) {
            case 'connected':
                break;
                break;
            case 'new_transaction':
                // Invalidate transactions and stats
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.transactions() });
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.activity() });
                toast('Nueva transacción pendiente', { icon: '💰' });
                break;
            case 'transaction_approved':
            case 'transaction_rejected':
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.transactions() });
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.activity() });
                break;
            case 'new_user':
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
                toast('Nuevo usuario registrado', { icon: '👤' });
                break;
            case 'game_created':
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.games() });
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.activity() });
                toast('Nueva partida creada', { icon: '🎮' });
                break;
            case 'stats_updated':
                queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
                break;
            case 'pong':
                // Keepalive response, ignore
                break;
            default:
                break;
        }
    }, [queryClient]);
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close(1000, 'User disconnected');
            wsRef.current = null;
        }
        setConnectionState('disconnected');
    }, []);
    // Send ping every 30 seconds to keep connection alive
    useEffect(() => {
        const pingInterval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
        return () => clearInterval(pingInterval);
    }, []);
    // Connect on mount, disconnect on unmount
    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);
    return { connectionState, reconnect: connect };
}
