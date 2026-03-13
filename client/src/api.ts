import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const notesApi = {
  getAll: (params?: any) => api.get('/notes', { params }),
  getOne: (id: string) => api.get(`/notes/${id}`),
  create: (data: any) => api.post('/notes', data),
  update: (id: string, data: any) => api.put(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
  restore: (id: string) => api.put(`/notes/${id}/restore`),
  removeAttachment: (noteId: string, publicId: string) => api.delete(`/notes/${noteId}/attachments/${encodeURIComponent(publicId)}`),
  getShared: (id: string) => api.get(`/notes/shared/${id}`),
};

export const tagsApi = {
  getAll: () => api.get('/tags'),
  create: (data: any) => api.post('/tags', data),
  update: (id: string, data: any) => api.put(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
  search: (q: string, limit = 10) => api.get('/tags', { params: { q, limit } }),
};

export const notebooksApi = {
  getAll: () => api.get('/notebooks'),
  getOne: (id: string) => api.get(`/notebooks/${id}`),
  create: (data: any) => api.post('/notebooks', data),
  update: (id: string, data: any) => api.put(`/notebooks/${id}`, data),
  delete: (id: string) => api.delete(`/notebooks/${id}`),
};

export const uploadsApi = {
  uploadFile: (formData: FormData) => api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markReadBulk: (ids: string[]) => api.post('/notifications/mark-read', { ids }),
  deleteBulk: (ids: string[]) => api.delete('/notifications', { data: { ids } })
}

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (token: string, data: { password: string }) => api.post(`/auth/reset-password/${token}`, data),
};

export const pushApi = {
  getVapidKey: () => api.get('/push/vapid'),
  saveSubscription: (subscription: any) => api.post('/push', { subscription }),
  deleteSubscription: () => api.delete('/push'),
  getSubscription: () => api.get('/push/subscription')
}

export default api;
