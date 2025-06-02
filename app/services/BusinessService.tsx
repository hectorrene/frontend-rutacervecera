import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { HandleLoginError } from "../../helpers/ErrorHandler";
import AuthService from './AuthService';

const API_BASE_URL = Platform.select({
  ios: 'http://192.168.100.191:3000/api',
  android: 'http://10.0.2.2:3000/api',
  default: 'http://192.168.100.191:3000/api'
});

class BusinessService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
  });

  constructor() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Crear un nuevo bar (solo para cuentas business)
  async createBar(barData: any): Promise<AxiosResponse> {
    try {
      return await this.api.post('/business/bars', barData);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener todos los bares del usuario business
  async getMyBars(): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/business/${userId}/bars`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Actualizar un bar específico
  async updateBar(barId: string, barData: any): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.put(`/business/${userId}/bars/${barId}`, barData);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Eliminar un bar
  async deleteBar(barId: string): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.delete(`/business/${userId}/bars/${barId}`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener el menú de un bar específico del usuario
  async getMyBarMenu(barId: string): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/business/${userId}/bars/${barId}/menu`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Agregar item al menú
  async addMenuItem(barId: string, menuItem: any): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/business/${userId}/bars/${barId}/menu`, menuItem);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Actualizar item del menú
  async updateMenuItem(barId: string, itemId: string, menuItem: any): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.put(`/business/${userId}/bars/${barId}/menu/${itemId}`, menuItem);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Eliminar item del menú
  async deleteMenuItem(barId: string, itemId: string): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.delete(`/business/${userId}/bars/${barId}/menu/${itemId}`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Crear un evento
  async createEvent(barId: string, eventData: any): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/business/${userId}/bars/${barId}/events`, eventData);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener eventos de un bar específico del usuario
  async getMyBarEvents(barId: string): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/business/${userId}/bars/${barId}/events`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Actualizar un evento
  async updateEvent(barId: string, eventId: string, eventData: any): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.put(`/business/${userId}/bars/${barId}/events/${eventId}`, eventData);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Eliminar un evento
  async deleteEvent(barId: string, eventId: string): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.delete(`/business/${userId}/bars/${barId}/events/${eventId}`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener reviews de un bar específico del usuario
  async getMyBarReviews(barId: string): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/business/${userId}/bars/${barId}/reviews`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Responder a un review
  async respondToReview(barId: string, reviewId: string, response: string): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/business/${userId}/bars/${barId}/reviews/${reviewId}/respond`, {
        response
      });
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener estadísticas del negocio
  async getBusinessStats(): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/business/${userId}/stats`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener estadísticas de un bar específico
  async getBarStats(barId: string): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/business/${userId}/bars/${barId}/stats`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Verificar si el usuario actual es business
  isBusinessAccount(): boolean {
    const user = AuthService.getCurrentUser();
    return user?.accountType === 'business';
  }

  // Subir imagen para el bar
  async uploadBarImage(barId: string, imageData: FormData): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/business/${userId}/bars/${barId}/upload-image`, imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Subir imagen para item del menú
  async uploadMenuItemImage(barId: string, itemId: string, imageData: FormData): Promise<AxiosResponse> {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/business/${userId}/bars/${barId}/menu/${itemId}/upload-image`, imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }
}

export default new BusinessService();