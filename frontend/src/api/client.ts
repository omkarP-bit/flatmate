import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URLS: Record<string, string> = {
  user:    import.meta.env.VITE_USER_SERVICE_URL    || 'http://localhost:8001',
  room:    import.meta.env.VITE_ROOM_SERVICE_URL    || 'http://localhost:8002',
  expense: import.meta.env.VITE_EXPENSE_SERVICE_URL || 'http://localhost:8003',
  payment: import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:8004',
};

function createClient(service: keyof typeof BASE_URLS) {
  const client = axios.create({ baseURL: BASE_URLS[service] });

  // Attach Cognito JWT on every request
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // On 401 → clear auth and redirect to login
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );

  return client;
}

export const userClient    = createClient('user');
export const roomClient    = createClient('room');
export const expenseClient = createClient('expense');
export const paymentClient = createClient('payment');