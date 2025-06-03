import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { HandleLoginError } from "../../helpers/ErrorHandler";
import { authService } from './AuthService'; // Cambiar a la instancia, no la clase

const API_BASE_URL = Platform.select({
  ios: 'http://192.168.100.191:3000/api',
  android: 'http://10.0.2.2:3000/api',
  default: 'http://192.168.100.191:3000/api'
});

class BarService {
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

  // Obtener el conteo de reviews de un usuario
  async getUserReviewCount(userId?: string): Promise<AxiosResponse> {
    try {
      const targetUserId = userId || authService.getCurrentUser()?._id;
      if (!targetUserId) throw new Error('User not authenticated');
      
      return await this.api.get(`/users/${targetUserId}/reviews/count`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Jala todos los bares
  async allBars(): Promise<AxiosResponse> {
    try {
      return await this.api.get('/bars');
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Jala un bar por su id
  async getBarById(id: string): Promise<AxiosResponse> {
    try {
      return await this.api.get(`/bars/${id}`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Jala el menú de un bar por su id
  async getMenuByBarId(id: string): Promise<AxiosResponse> {
    try {
      return await this.api.get(`/bars/${id}/menu`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Jala un item del menu de un bar por su id
  async getMenuItemById(barId: string, itemId: string) {
    try {
      const response = await this.api.get(`/bars/${barId}/menu/${itemId}`);
      return response.data; // Returns the menu item object
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Menu item not found');
      }
      throw error; // Re-throw other errors
    }
  }

  // Jala la comida de un bar por su id
  async getFoodByBarId(id: string): Promise<AxiosResponse> {
    try {
      return await this.api.get(`/bars/${id}/food`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Jala las bebidas de un bar por su id
  async getDrinksByBarId(id: string): Promise<AxiosResponse> {
    try {
      return await this.api.get(`/bars/${id}/drinks`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Jala el alcohol de un bar por su id
  async getAlcoholByBarId(id: string): Promise<AxiosResponse> {
    try {
      return await this.api.get(`/bars/${id}/alcohol`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Jala los eventos de un bar por su id
  async getEventsByBarId(id: string): Promise<AxiosResponse> {
    try {
      return await this.api.get(`/bars/${id}/events`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Jala los reviews de un bar por su id
  async getReviewsByBarId(id: string): Promise<AxiosResponse> {
    try {
      return await this.api.get(`/bars/${id}/reviews`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Crear una review para un bar
async createReview(barId: string, reviewData: {
  rating: number;
  comment: string;
  photos?: string[];
}): Promise<AxiosResponse> {
  try {
    return await this.api.post(`/bars/${barId}/reviews`, reviewData);
  } catch (error) {
    HandleLoginError(error);
    throw error;
  }
}

// Actualizar una review
async updateReview(reviewId: string, reviewData: {
  rating?: number;
  comment?: string;
  photos?: string[];
}): Promise<AxiosResponse> {
  try {
    return await this.api.put(`/reviews/${reviewId}`, reviewData);
  } catch (error) {
    HandleLoginError(error);
    throw error;
  }
}

// Eliminar una review
async deleteReview(reviewId: string): Promise<AxiosResponse> {
  try {
    return await this.api.delete(`/reviews/${reviewId}`);
  } catch (error) {
    HandleLoginError(error);
    throw error;
  }
}

// Verificar si el usuario ya hizo una review para un bar
async checkUserReview(barId: string): Promise<{hasReviewed: boolean, review?: any}> {
  const userId = authService.getCurrentUser()?._id;
  if (!userId) return { hasReviewed: false };
  
  try {
    const response = await this.api.get(`/users/${userId}/reviews/${barId}/check`);
    return response.data;
  } catch (error) {
    return { hasReviewed: false };
  }
}

// Obtener estadísticas de reviews de un bar
async getBarReviewStats(barId: string): Promise<AxiosResponse> {
  try {
    return await this.api.get(`/bars/${barId}/reviews/stats`);
  } catch (error) {
    HandleLoginError(error);
    throw error;
  }
}

// Obtener reviews de un usuario
async getUserReviews(userId?: string): Promise<AxiosResponse> {
  try {
    const targetUserId = userId || authService.getCurrentUser()?._id;
    if (!targetUserId) throw new Error('User not authenticated');
    
    return await this.api.get(`/users/${targetUserId}/reviews`);
  } catch (error) {
    HandleLoginError(error);
    throw error;
  }
}

  // jala todos los eventos 
  async getAllEvents(): Promise<AxiosResponse> {
    try {
      return await this.api.get('/events');
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // evento por id
  async getEventById(id: string): Promise<AxiosResponse> {
    try {
      return await this.api.get(`/events/${id}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // mi perfil
  async getMyProfile(): Promise<AxiosResponse> {
    try {
      return await this.api.get('/users/me');
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Actualizar perfil
  async updateProfile(userData: any): Promise<AxiosResponse> {
    try {
      return await this.api.put('/users/me', userData);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Agregar a favoritos
  async addBarToFavorites(barId: string): Promise<AxiosResponse> {
    const userId = authService.getCurrentUser()?._id; // Usar la instancia authService
    if (!userId) throw new Error('User not authenticated');
    
    try {
      return await this.api.post(`/users/${userId}/favorites/${barId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
      }
      throw error;
    }
  }

  // eliminar de favoritos
  async removeBarFromFavorites(barId: string): Promise<AxiosResponse> {
    const userId = authService.getCurrentUser()?._id; // Usar la instancia authService
    if (!userId) throw new Error('User not authenticated');
    
    return await this.api.delete(`/users/${userId}/favorites/${barId}`);
  }

  // verificar si un bar es favorito
  async isBarFavorite(barId: string): Promise<boolean> {
    const userId = authService.getCurrentUser()?._id; // Usar la instancia authService
    if (!userId) return false;
    
    try {
      const response = await this.api.get(`/users/${userId}/favorites/${barId}/check`);
      return response.data.isFavorite;
    } catch (error) {
      return false;
    }
  }

  // Jala los favoritos de un usuario
  async getFavorites(userId: string): Promise<AxiosResponse> {
    try {
      return await this.api.get(`/users/${userId}/favorites`);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }
}

export default new BarService();