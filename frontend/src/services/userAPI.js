import { api } from './api';

export const userAPI = {
  list: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    return api.get(`/admin/users?${queryParams}`);
  },

  get: (id) => api.get(`/admin/users/${id}`),

  create: (data) => api.post('/admin/users', data),

  update: (id, data) => api.put(`/admin/users/${id}`, data),

  changePassword: (id, newPassword) => api.put(`/admin/users/${id}/password`, { new_password: newPassword }),

  delete: (id) => api.delete(`/admin/users/${id}`),
};
