import axios, { InternalAxiosRequestConfig } from "axios";
import type { UserTransaction, UserStats } from "../types";

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

// User Transaction API functions
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

export default api;
