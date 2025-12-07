import axios from "axios";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// User Transaction API functions
export async function fetchTransactions(params) {
    const response = await api.get("/transactions/me", { params });
    return response.data;
}
export async function fetchUserStats(days) {
    const response = await api.get("/transactions/stats", {
        params: days ? { days } : undefined
    });
    return response.data;
}
export default api;
