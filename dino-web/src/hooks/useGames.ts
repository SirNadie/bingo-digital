import api from '../api/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { ApiError } from '../types';

// Types
export interface Game {
    id: string;
    creator_id: string;
    price: number;
    min_tickets: number;
    status: 'OPEN' | 'READY' | 'RUNNING' | 'FINISHED' | 'CANCELLED';
    sold_tickets: number;
}

export interface GameState {
    id: string;
    status: string;
    price: number;
    min_tickets: number;
    sold_tickets: number;
    drawn_numbers: number[];
    paid_diagonal: boolean;
    paid_line: boolean;
    paid_bingo: boolean;
    creator_id: string;
}

export interface CreateGamePayload {
    price: number;
    autostart_enabled?: boolean;
    autostart_threshold?: number;
    autostart_delay_minutes?: number;
}

export interface Ticket {
    id: string;
    game_id: string;
    user_id: string;
    numbers: number[][];
    payout?: number;
    wins?: string[];
}

// API Functions
async function fetchGames(status?: string): Promise<{ items: Game[] }> {
    const params = status ? { status } : {};
    const { data } = await api.get('/games', { params });
    return data;
}

async function fetchGameState(gameId: string): Promise<GameState> {
    const { data } = await api.get(`/games/${gameId}/state`);
    return data;
}

async function createGame(payload: CreateGamePayload): Promise<Game> {
    const { data } = await api.post('/games', payload);
    return data;
}

async function startGame(gameId: string): Promise<Game> {
    const { data } = await api.post(`/games/${gameId}/start`);
    return data;
}

async function drawNumber(gameId: string) {
    const { data } = await api.post(`/games/${gameId}/draw`);
    return data;
}

async function buyAutoTicket(gameId: string): Promise<Ticket> {
    const { data } = await api.post(`/tickets/games/${gameId}/auto`);
    return data;
}

async function fetchMyTicketsForGame(gameId: string): Promise<{ items: Ticket[] }> {
    const { data } = await api.get(`/games/${gameId}/my-tickets`);
    return data;
}

// Hooks
export function useGames(status?: string) {
    return useQuery({
        queryKey: ['games', status],
        queryFn: () => fetchGames(status),
        refetchInterval: 5000, // Refetch every 5 seconds
    });
}

async function fetchMyActiveGames(): Promise<{ items: Game[] }> {
    const { data } = await api.get('/games/my-active');
    return data;
}

export function useMyActiveGames() {
    return useQuery({
        queryKey: ['my-active-games'],
        queryFn: fetchMyActiveGames,
        refetchInterval: 5000, // Refetch every 5 seconds
    });
}

export function useGameState(gameId: string | null) {
    return useQuery({
        queryKey: ['game-state', gameId],
        queryFn: () => fetchGameState(gameId!),
        enabled: !!gameId,
        refetchInterval: 2000, // Refetch every 2 seconds during game
    });
}

export function useMyTickets(gameId: string | null) {
    return useQuery({
        queryKey: ['my-tickets', gameId],
        queryFn: () => fetchMyTicketsForGame(gameId!),
        enabled: !!gameId,
    });
}

export function useCreateGame() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createGame,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
            toast.success('¡Partida creada exitosamente!');
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.detail || 'Error al crear partida';
            toast.error(message);
        },
    });
}

export function useStartGame() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: startGame,
        onSuccess: (_, gameId) => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
            queryClient.invalidateQueries({ queryKey: ['game-state', gameId] });
            toast.success('¡Partida iniciada!');
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.detail || 'Error al iniciar partida';
            toast.error(message);
        },
    });
}

export function useDrawNumber() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: drawNumber,
        onSuccess: (data, gameId) => {
            queryClient.invalidateQueries({ queryKey: ['game-state', gameId] });
            // Notification is handled by WebSocket for everyone (including creator)
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.detail || 'Error al sortear';
            toast.error(message);
        },
    });
}

export function useBuyTicket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: buyAutoTicket,
        onSuccess: (_, gameId) => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
            queryClient.invalidateQueries({ queryKey: ['my-tickets', gameId] });
            toast.success('¡Cartón comprado!');
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.detail || 'Error al comprar cartón';
            toast.error(message);
        },
    });
}

async function cancelGame(gameId: string): Promise<Game> {
    const { data } = await api.post(`/games/${gameId}/cancel`);
    return data;
}

export function useCancelGame() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelGame,
        onSuccess: (_, gameId) => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
            queryClient.invalidateQueries({ queryKey: ['game-state', gameId] });
            toast.success('Partida cancelada. Se reembolsaron los cartones.');
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.detail || 'Error al cancelar partida';
            toast.error(message);
        },
    });
}

