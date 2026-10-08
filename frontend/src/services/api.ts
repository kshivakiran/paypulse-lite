import axios from 'axios';

const API_BASE = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Axios Request Interceptor to automatically attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('paypulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add Axios Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('paypulse_token');
      localStorage.removeItem('paypulse_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);
