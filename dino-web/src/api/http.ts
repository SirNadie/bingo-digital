import axios, { InternalAxiosRequestConfig } from "axios";
import type { UserTransaction, UserStats, AdminStats, AdminUser, AdminGame, AdminTransaction, AdminActivityItem } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Transaction API functions
export async function fetchTransactions(params?: {
  limit?: number;
  offset?: number;
  type?: string;
  days?: number;
}): Promise<{ transactions: UserTransaction[]; total: number }> {
  const response = await api.get("/transactions/me", { params });
  return response.data;
}

export async function fetchUserStats(days?: number): Promise<UserStats> {
  const response = await api.get("/transactions/stats", {
    params: days ? { days } : undefined
  });
  return response.data;
}

// Admin API functions
export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await api.get("/admin/stats");
  return response.data;
}

export async function fetchAdminUsers(): Promise<{ items: AdminUser[] }> {
  const response = await api.get("/admin/users");
  return response.data;
}

export async function fetchAdminGames(): Promise<{ items: AdminGame[] }> {
  const response = await api.get("/admin/games");
  return response.data;
}

export async function fetchAdminTransactions(): Promise<{ items: AdminTransaction[] }> {
  const response = await api.get("/admin/transactions");
  return response.data;
}

export async function fetchAdminActivity(): Promise<{ items: AdminActivityItem[] }> {
  const response = await api.get("/admin/activity");
  return response.data;
}

export default api;


