import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const paperService = {
  upload: (data: FormData) => api.post('/papers/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  approve: (id: number, data: { release_datetime: string, download_window_seconds: number }) => api.patch(`/papers/approve/${id}`, data),
  reject: (id: number, data: { reason: string }) => api.patch(`/papers/reject/${id}`, data),
  download: (id: number) => api.get(`/papers/download/${id}`, { responseType: 'blob' }),
};

export default api;
