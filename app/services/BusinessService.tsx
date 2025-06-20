import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { HandleLoginError } from "../../helpers/ErrorHandler";
import { getCurrentUserGlobal } from '../context/AuthContext'; // Importar la función global

const API_BASE_URL = Platform.select({
  ios: 'http://44.202.149.213:3000/api',
  android: 'http://10.0.2.2:3000/api',
  default: 'http://44.202.149.213:3000/api'
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
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/bars/owner/${userId}`, barData);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener todos los bares del usuario business
  async getMyBars(): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/bars/owner/${userId}`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener un bar específico del usuario
  async getMyBar(barId: string): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/bars/owner/${userId}/${barId}`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Actualizar un bar específico
  async updateBar(barId: string, barData: any): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.put(`/bars/owner/${userId}/${barId}`, barData);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Eliminar un bar
  async deleteBar(barId: string): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.delete(`/bars/owner/${userId}/${barId}`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener el menú de un bar específico del usuario
  async getMyBarMenu(barId: string): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/bars/owner/${userId}/${barId}/menu`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Agregar item al menú
  async addMenuItem(barId: string, menuItem: any): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/bars/owner/${userId}/${barId}/menu`, menuItem);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Actualizar item del menú
  async updateMenuItem(barId: string, itemId: string, menuItem: any): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.put(`/bars/owner/${userId}/${barId}/menu/${itemId}`, menuItem);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Eliminar item del menú
  async deleteMenuItem(barId: string, itemId: string): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.delete(`/bars/owner/${userId}/${barId}/menu/${itemId}`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Crear un evento
  async createEvent(barId: string, eventData: any): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/bars/owner/${userId}/${barId}/events`, eventData);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener eventos de un bar específico del usuario
  async getMyBarEvents(barId: string): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/bars/owner/${userId}/${barId}/events`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener un evento específico del usuario
async getEvent(barId: string, eventId: string): Promise<AxiosResponse> {
  try {
    const userId = getCurrentUserGlobal()?._id;
    if (!userId) throw new Error('User not authenticated');
    
    return await this.api.get(`/bars/owner/${userId}/${barId}/events/${eventId}`);
  } catch (error) {
    HandleLoginError(error);
    throw error;
  }
}

  // Actualizar un evento
  async updateEvent(barId: string, eventId: string, eventData: any): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.put(`/bars/owner/${userId}/${barId}/events/${eventId}`, eventData);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Eliminar un evento
  async deleteEvent(barId: string, eventId: string): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.delete(`/bars/owner/${userId}/${barId}/events/${eventId}`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener reviews de un bar específico del usuario
  async getMyBarReviews(barId: string): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/bars/owner/${userId}/${barId}/reviews`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Verificar si el usuario actual es business
  isBusinessAccount(): boolean {
    const user = getCurrentUserGlobal();
    return user?.accountType === 'business';
  }

  // NOTA: Los siguientes métodos no tienen endpoints correspondientes en tu backend
  // Puedes implementarlos más tarde o eliminarlos si no los necesitas

  // Responder a un review (ENDPOINT NO IMPLEMENTADO EN BACKEND)
  async respondToReview(barId: string, reviewId: string, response: string): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/bars/owner/${userId}/${barId}/reviews/${reviewId}/respond`, {
        response
      });
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener estadísticas del negocio (ENDPOINT NO IMPLEMENTADO EN BACKEND)
  async getBusinessStats(): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/business/${userId}/stats`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Obtener estadísticas de un bar específico (ENDPOINT NO IMPLEMENTADO EN BACKEND)
  async getBarStats(barId: string): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.get(`/bars/owner/${userId}/${barId}/stats`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Subir imagen para el bar (ENDPOINT NO IMPLEMENTADO EN BACKEND)
  async uploadBarImage(barId: string, imageData: FormData): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/bars/owner/${userId}/${barId}/upload-image`, imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Subir imagen para item del menú (ENDPOINT NO IMPLEMENTADO EN BACKEND)
  async uploadMenuItemImage(barId: string, itemId: string, imageData: FormData): Promise<AxiosResponse> {
    try {
      const userId = getCurrentUserGlobal()?._id;
      if (!userId) throw new Error('User not authenticated');
      
      return await this.api.post(`/bars/owner/${userId}/${barId}/menu/${itemId}/upload-image`, imageData, {
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
