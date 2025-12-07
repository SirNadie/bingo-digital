import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/http';
// ============================================
// API Functions
// ============================================
async function fetchAdminStats() {
    const { data } = await api.get('/admin/stats');
    return data;
}
async function fetchAdminUsers() {
    const { data } = await api.get('/admin/users');
    return data.items.map((u) => ({
        ...u,
        lastSeen: u.last_seen ?? u.lastSeen,
        gamesPlayed: u.games_played ?? u.gamesPlayed,
    }));
}
async function fetchAdminGames() {
    const { data } = await api.get('/admin/games');
    return data.items.map((g) => ({
        ...g,
        buyIn: g.buy_in ?? g.buyIn,
    }));
}
async function fetchAdminTransactions() {
    const { data } = await api.get('/admin/transactions');
    return data.items;
}
async function fetchAdminActivity() {
    const { data } = await api.get('/admin/activity');
    return data.items;
}
async function approveTransaction(id) {
    await api.post(`/admin/transactions/${id}/approve`);
}
async function rejectTransaction(id) {
    await api.post(`/admin/transactions/${id}/reject`);
}
// ============================================
// Query Keys
// ============================================
export const adminQueryKeys = {
    all: ['admin'],
    stats: () => [...adminQueryKeys.all, 'stats'],
    users: () => [...adminQueryKeys.all, 'users'],
    games: () => [...adminQueryKeys.all, 'games'],
    transactions: () => [...adminQueryKeys.all, 'transactions'],
    activity: () => [...adminQueryKeys.all, 'activity'],
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
        onError: (error) => {
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
        onError: (error) => {
            const message = error.response?.data?.detail || 'Error al rechazar transacción';
            toast.error(message);
        },
    });
}
