import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] ?? '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      window.location.href = '/api/auth/google';
    }
    return Promise.reject(err);
  },
);
