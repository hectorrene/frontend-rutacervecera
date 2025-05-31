import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
  ios: 'http://192.168.100.191:3000/api',  // Use your machine's IP address
  android: 'http://10.0.2.2:3000/api',  // Special Android localhost
  default: 'http://192.168.100.191:3000/api'
});

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  photo: string;
  accountType: 'business' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  password: string;
  photo?: string;
  accountType?: 'business' | 'user';
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private token: string | null = null;

  private constructor() {
    this.loadStoredAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Load stored authentication data
  private async loadStoredAuth(): Promise<void> {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('authUser');
      
      if (storedToken && storedUser) {
        this.token = storedToken;
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  }

  // Register new user
  public async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        await this.storeAuthData(data.user, data.token);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo.',
      };
    }
  }

  // Login user
  public async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        await this.storeAuthData(data.user, data.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo.',
      };
    }
  }

  // Logout user
  public async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['authToken', 'authUser']);
      this.currentUser = null;
      this.token = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  // Get auth token
  public getToken(): string | null {
    return this.token;
  }

  // Get user profile
  public async getUserProfile(): Promise<AuthResponse> {
    try {
      if (!this.token) {
        return {
          success: false,
          message: 'No hay token de autenticación',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        this.currentUser = data.user;
        await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        message: 'Error al obtener el perfil',
      };
    }
  }

  // Update user profile
  public async updateProfile(updateData: Partial<RegisterData>): Promise<AuthResponse> {
    try {
      if (!this.token) {
        return {
          success: false,
          message: 'No hay token de autenticación',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success && data.user) {
        this.currentUser = data.user;
        await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: 'Error al actualizar el perfil',
      };
    }
  }

  // Store authentication data
  private async storeAuthData(user: User, token: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['authUser', JSON.stringify(user)],
      ]);
      
      this.currentUser = user;
      this.token = token;
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }

  // Validate token
  public async validateToken(): Promise<boolean> {
    try {
      if (!this.token) return false;

      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}

export default AuthService.getInstance();