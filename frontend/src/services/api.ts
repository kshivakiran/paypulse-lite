import axios from 'axios';

// In production (Vercel), the frontend calls the Render backend directly.
// In development, Vite's proxy rewrites /api → localhost:5000.
const API_BASE =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT Bearer token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('paypulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler — log out user only when session expires, not on auth endpoints
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      const isTelemetry = url.includes('/audit-logs');

      if (!isAuthEndpoint && !isTelemetry) {
        localStorage.removeItem('paypulse_token');
        localStorage.removeItem('paypulse_user');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);
