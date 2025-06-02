import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

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
  private isInitialized: boolean = false;
  private initializePromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ✅ Método mejorado de inicialización con singleton pattern
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Si ya está inicializando, esperar a que termine
    if (this.initializePromise) {
      return this.initializePromise;
    }

    this.initializePromise = this.loadStoredAuth();
    await this.initializePromise;
    this.isInitialized = true;
  }

  private async loadStoredAuth(): Promise<void> {
    try {
      console.log('📱 Cargando datos de autenticación almacenados...');
      
      const [storedToken, storedUser] = await AsyncStorage.multiGet(['authToken', 'authUser']);
      
      const token = storedToken[1];
      const userStr = storedUser[1];
      
      if (token && userStr) {
        this.token = token;
        this.currentUser = JSON.parse(userStr);
        console.log('✅ Datos de autenticación cargados correctamente');
      } else {
        console.log('ℹ️ No hay datos de autenticación almacenados');
      }
    } catch (error) {
      console.error('❌ Error cargando datos almacenados:', error);
      await this.clearStoredAuth();
    }
  }

  private async clearStoredAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['authToken', 'authUser']);
      this.currentUser = null;
      this.token = null;
    } catch (error) {
      console.error('Error limpiando datos almacenados:', error);
    }
  }

  // ✅ Método helper para hacer requests con mejor manejo de errores
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  public async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 Registrando usuario...');
      
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        await this.storeAuthData(data.user, data.token);
        console.log('✅ Usuario registrado correctamente');
      }

      return data;
    } catch (error: unknown) {
      console.error('❌ Error en registro:', error);
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  public async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      console.log('🔐 Iniciando sesión...');
      
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        await this.storeAuthData(data.user, data.token);
        console.log('✅ Sesión iniciada correctamente');
      }

      return data;
    } catch (error: unknown) {
      console.error('❌ Error en login:', error);
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  public async logout(): Promise<void> {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Intentar hacer logout en el servidor si hay token
      if (this.token) {
        try {
          await this.makeRequest('/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
            },
          });
        } catch (error) {
          console.log('⚠️ Error en logout del servidor, continuando con limpieza local');
        }
      }
      
      await this.clearStoredAuth();
      console.log('✅ Sesión cerrada correctamente');
    } catch (error: unknown) {
      console.error('❌ Error en logout:', error);
      // Forzar limpieza local aunque falle
      await this.clearStoredAuth();
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  public getToken(): string | null {
    return this.token;
  }

  public async getUserProfile(): Promise<AuthResponse> {
    try {
      if (!this.token) {
        return {
          success: false,
          message: 'No hay token de autenticación',
        };
      }

      console.log('👤 Obteniendo perfil de usuario...');
      
      const response = await this.makeRequest('/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        await this.updateStoredUser(data.user);
        console.log('✅ Perfil obtenido correctamente');
      }

      return data;
    } catch (error: unknown) {
      console.error('❌ Error obteniendo perfil:', error);
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  public async updateProfile(updateData: Partial<RegisterData>): Promise<AuthResponse> {
    try {
      if (!this.token) {
        return {
          success: false,
          message: 'No hay token de autenticación',
        };
      }

      console.log('📝 Actualizando perfil...');
      
      const response = await this.makeRequest('/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success && data.user) {
        await this.updateStoredUser(data.user);
        console.log('✅ Perfil actualizado correctamente');
      }

      return data;
    } catch (error: unknown) {
      console.error('❌ Error actualizando perfil:', error);
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  public async validateToken(): Promise<boolean> {
    try {
      if (!this.token) return false;

      console.log('🔍 Validando token...');
      
      const response = await this.makeRequest('/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      
      const isValid = data.success && response.ok;
      console.log('🔍 Token válido:', isValid);
      
      if (!isValid) {
        await this.clearStoredAuth();
      }
      
      return isValid;
    } catch (error: unknown) {
      console.error('❌ Error validando token:', error);
      return false;
    }
  }

  private async storeAuthData(user: User, token: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['authUser', JSON.stringify(user)],
      ]);
      
      this.currentUser = user;
      this.token = token;
    } catch (error: unknown) {
      console.error('❌ Error almacenando datos de auth:', error);
    }
  }

  private async updateStoredUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      this.currentUser = user;
    } catch (error) {
      console.error('❌ Error actualizando usuario almacenado:', error);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return 'Tiempo de espera agotado. Verifica tu conexión.';
      }
      return error.message;
    }
    return 'Error de conexión. Intenta de nuevo.';
  }
}

export default AuthService.getInstance();