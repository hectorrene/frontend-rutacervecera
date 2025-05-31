import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Bar endpoints
export const BarService = {
  getAll: () => api.get('/bars'),
  getById: (id: string) => api.get(`/bars/${id}`),
  createReview: (barId: string, data: { rating: number; comment: string }) =>
    api.post(`/bars/${barId}/reviews`, data),
};

// Menu endpoints
export const MenuService = {
  getItems: (barId: string) => api.get(`/bars/${barId}/menu-items`),
  getItem: (id: string) => api.get(`/menu-items/${id}`),
};

// User endpoints
export const UserService = {
  getFavorites: () => api.get('/users/me/favorites'),
  toggleFavorite: (data: { barId?: string; menuItemId?: string }) =>
    api.post('/favorites', data),
};

export default api;