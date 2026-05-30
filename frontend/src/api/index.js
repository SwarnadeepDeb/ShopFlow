import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const userApi = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const productApi = {
  create: (data) => api.post('/products', data),
  getAll: () => api.get('/products'),
  getOne: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const orderApi = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const notificationApi = {
  create: (data) => api.post('/notifications', data),
  getAll: () => api.get('/notifications'),
  getOne: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}`),
  delete: (id) => api.delete(`/notifications/${id}`),
};
