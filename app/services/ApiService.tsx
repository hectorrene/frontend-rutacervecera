import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// ✅ Usar la misma URL base que AuthService
const API_BASE_URL = Platform.select({
  ios: 'http://192.168.100.191:3000/api',
  android: 'http://10.0.2.2:3000/api',
  default: 'http://192.168.100.191:3000/api'
});

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
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error obteniendo token para request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Agregar interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.log('🔑 Token inválido, limpiando datos de autenticación');
      try {
        await AsyncStorage.multiRemove(['authToken', 'authUser']);
      } catch (storageError) {
        console.error('Error limpiando storage:', storageError);
      }
    }
    return Promise.reject(error);
  }
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