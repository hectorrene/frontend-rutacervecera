import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración base de la API
const API_BASE_URL = 'http://44.202.149.213:3000/api';
const TOKEN_KEY = 'auth_token';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    console.log('🔧 ApiService initialized with baseUrl:', baseUrl);
  }

  // ✅ HACER PÚBLICO - Obtener token del almacenamiento
  async getToken(): Promise<string | null> {
    try {
      console.log('🔑 Getting token from AsyncStorage...');
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      console.log('🔑 Token retrieved:', token ? 'TOKEN_EXISTS' : 'NO_TOKEN');
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  // Guardar token en el almacenamiento
  async saveToken(token: string): Promise<void> {
    try {
      console.log('💾 Saving token to AsyncStorage...');
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('✅ Token saved successfully');
    } catch (error) {
      console.error('❌ Error saving token:', error);
    }
  }

  // Eliminar token del almacenamiento
  async removeToken(): Promise<void> {
    try {
      console.log('🗑️ Removing token from AsyncStorage...');
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log('✅ Token removed successfully');
    } catch (error) {
      console.error('❌ Error removing token:', error);
    }
  }

  // Headers por defecto
  private async getHeaders(includeAuth: boolean = true): Promise<Record<string, string>> {
    console.log('📋 Building headers, includeAuth:', includeAuth);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Authorization header added');
      } else {
        console.log('⚠️ No token available for authorization');
      }
    }

    console.log('📋 Final headers:', headers);
    return headers;
  }

  // Método genérico para hacer peticiones
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`🌐 Making ${options.method || 'GET'} request to:`, url);
      console.log('🌐 Request options:', options);
      
      const headers = await this.getHeaders(includeAuth);

      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      console.log('🌐 Final request config:', config);

      // Agregar timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after 10 seconds');
        controller.abort();
      }, 10000);

      const fetchConfig = {
        ...config,
        signal: controller.signal,
      };

      console.log('🚀 Starting fetch request...');
      const response = await fetch(url, fetchConfig);
      clearTimeout(timeoutId);
      
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          data
        });

        return {
          success: false,
          message: data.message || `HTTP Error: ${response.status}`,
          data: undefined
        };
      }

      const result = {
        success: true,
        message: data.message,
        data: data.user || data.data || data
      };

      console.log('✅ Request successful, returning:', result);
      return result;

    } catch (error) {
      console.error('❌ Network Error in request:', error);
      if (typeof error === 'object' && error !== null && 'name' in error && 'message' in error) {
        console.error('❌ Error name:', (error as { name: string }).name);
        console.error('❌ Error message:', (error as { message: string }).message);
        if ((error as { name: string }).name === 'AbortError') {
          return {
            success: false,
            message: 'Request timeout - Check your internet connection and API server',
            data: undefined
          };
        }
      }

      return {
        success: false,
        message: 'Error de conexión. Verifica tu internet y que la API esté corriendo.',
        data: undefined
      };
    }
  }

  // Métodos HTTP específicos
  async get<T = any>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    console.log('📥 GET request to:', endpoint);
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    console.log('📤 POST request to:', endpoint, 'with data:', data);
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async put<T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    console.log('📝 PUT request to:', endpoint, 'with data:', data);
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async delete<T = any>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    console.log('🗑️ DELETE request to:', endpoint);
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  // Método para verificar si hay conexión
  async checkConnection(): Promise<boolean> {
    try {
      console.log('🔍 Checking connection to:', this.baseUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Connection check timeout');
        controller.abort();
      }, 5000);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('🔍 Connection check result:', response.ok);
      return response.ok;
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      return false;
    }
  }
}

// Instancia singleton
export const apiService = new ApiService();
export default ApiService;
