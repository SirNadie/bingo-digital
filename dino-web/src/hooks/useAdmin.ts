import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/http';
import type {
    AdminStats,
    AdminUser,
    AdminGame,
    AdminTransaction,
    AdminActivityItem,
    ApiError,
} from '../types';

// ============================================
// API Functions
// ============================================

async function fetchAdminStats(): Promise<AdminStats> {
    const { data } = await api.get('/admin/stats');
    return data;
}

async function fetchAdminUsers(): Promise<AdminUser[]> {
    const { data } = await api.get<{ items: AdminUser[] }>('/admin/users');
    return data.items.map((u) => ({
        ...u,
        lastSeen: (u as { last_seen?: string }).last_seen ?? u.lastSeen,
        gamesPlayed: (u as { games_played?: number }).games_played ?? u.gamesPlayed,
    }));
}

async function fetchAdminGames(): Promise<AdminGame[]> {
    const { data } = await api.get<{ items: AdminGame[] }>('/admin/games');
    return data.items.map((g) => ({
        ...g,
        buyIn: (g as { buy_in?: number }).buy_in ?? g.buyIn,
    }));
}

async function fetchAdminTransactions(): Promise<AdminTransaction[]> {
    const { data } = await api.get<{ items: AdminTransaction[] }>('/admin/transactions');
    return data.items;
}

async function fetchAdminActivity(): Promise<AdminActivityItem[]> {
    const { data } = await api.get<{ items: AdminActivityItem[] }>('/admin/activity');
    return data.items;
}

async function approveTransaction(id: string): Promise<void> {
    await api.post(`/admin/transactions/${id}/approve`);
}

async function rejectTransaction(id: string): Promise<void> {
    await api.post(`/admin/transactions/${id}/reject`);
}

// ============================================
// Query Keys
// ============================================

export const adminQueryKeys = {
    all: ['admin'] as const,
    stats: () => [...adminQueryKeys.all, 'stats'] as const,
    users: () => [...adminQueryKeys.all, 'users'] as const,
    games: () => [...adminQueryKeys.all, 'games'] as const,
    transactions: () => [...adminQueryKeys.all, 'transactions'] as const,
    activity: () => [...adminQueryKeys.all, 'activity'] as const,
};

// ============================================
// Query Hooks
// ============================================

export function useAdminStats() {
    return useQuery({
        queryKey: adminQueryKeys.stats(),
        queryFn: fetchAdminStats,
        refetchInterval: 10000,
    });
}

export function useAdminUsers() {
    return useQuery({
        queryKey: adminQueryKeys.users(),
        queryFn: fetchAdminUsers,
        refetchInterval: 30000,
    });
}

export function useAdminGames() {
    return useQuery({
        queryKey: adminQueryKeys.games(),
        queryFn: fetchAdminGames,
        refetchInterval: 10000,
    });
}

export function useAdminTransactions() {
    return useQuery({
        queryKey: adminQueryKeys.transactions(),
        queryFn: fetchAdminTransactions,
        refetchInterval: 10000,
    });
}

export function useAdminActivity() {
    return useQuery({
        queryKey: adminQueryKeys.activity(),
        queryFn: fetchAdminActivity,
        refetchInterval: 10000,
    });
}

// ============================================
// Mutation Hooks
// ============================================

export function useApproveTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: approveTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.transactions() });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.activity() });
            toast.success('Transacción aprobada');
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.detail || 'Error al aprobar transacción';
            toast.error(message);
        },
    });
}

export function useRejectTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rejectTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.transactions() });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.activity() });
            toast.success('Transacción rechazada');
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.detail || 'Error al rechazar transacción';
            toast.error(message);
        },
    });
}
