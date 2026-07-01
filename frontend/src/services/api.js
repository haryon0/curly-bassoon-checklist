import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s for PDF generation
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const templatesAPI = {
  list: () => api.get('/templates'),
  getById: (id) => api.get(`/templates/${id}`),
  viewUrl: (id) => {
    const token = localStorage.getItem('token');
    return `/api/templates/${id}/view?token=${token}`;
  },
  create: (formData) => api.post('/templates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/templates/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/templates/${id}`),
  uploadPdf: (id, formData) => api.post(`/templates/${id}/upload-pdf`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const checklistAPI = {
  stats: () => api.get('/checklist/stats'),
  list: (params) => api.get('/checklist/my', { params }),
  getById: (id) => api.get(`/checklist/${id}`),
  submit: (formData, onProgress) => api.post('/checklist/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
    onUploadProgress: onProgress,
  }),
  delete: (id) => api.delete(`/checklist/${id}`),
  downloadUrl: (id) => {
    const token = localStorage.getItem('token');
    return `/api/checklist/${id}/download?token=${token}`;
  },
};

export default api;
