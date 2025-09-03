import axios from 'axios';

const API_BASE = 'http://localhost:8000';

// Configurar axios base
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bingo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bingo_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (phone) => api.post('/auth/login', { phone }),
  verify: (phone, code) => api.post('/auth/verify', { phone, code }),
  getProfile: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  deposit: (amount, paymentMethod) => 
    api.post('/user/deposit', { amount, payment_method: paymentMethod }),
  withdraw: (amount) => api.post('/user/withdraw', { amount }),
  getTransactions: () => api.get('/user/transactions'),
  getProfile: () => api.get('/user/profile'),
};

export const gameAPI = {
  create: (name, entryCost) => 
    api.post('/api/bingo/create', { name, entry_cost: entryCost }),
  list: () => api.get('/api/bingo/list'),
  join: (gameId, cartonsCount) => 
    api.post('/api/bingo/join', { game_id: gameId, cartons_count: cartonsCount }),
  start: (gameId) => api.post('/api/bingo/start', { game_id: gameId }),
  getGame: (gameId) => api.get(`/api/bingo/${gameId}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (limit = 100, skip = 0) => 
    api.get(`/admin/users?limit=${limit}&skip=${skip}`),
  getTransactions: (status, limit = 50, skip = 0) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit);
    params.append('skip', skip);
    return api.get(`/admin/transactions?${params}`);
  },
  approveWithdrawal: (transactionId, notes = '') => 
    api.post(`/admin/transactions/${transactionId}/approve`, { admin_notes: notes }),
  adjustCredits: (userId, amount, reason) => 
    api.post('/admin/adjust-credits', { user_id: userId, amount, reason }),
};

export default api;