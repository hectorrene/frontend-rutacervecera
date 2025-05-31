import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { HandleLoginError } from "../../helpers/ErrorHandler";

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

  // Get my profile
  async getMyProfile(): Promise<AxiosResponse> {
    try {
      return await this.api.get('/users/me');
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  // Update profile
  async updateProfile(userData: any): Promise<AxiosResponse> {
    try {
      return await this.api.put('/users/me', userData);
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  //  favoritos
  async toggleFavorite(barId: string, action: 'add'|'remove') {
    return action === 'add' 
      ? this.api.post(`/bars/${barId}/favorites`)
      : this.api.delete(`/bars/${barId}/favorites`);
  }
}

export default new BarService();

