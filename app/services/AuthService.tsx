import { apiService } from './ApiService';

// Tipos para las peticiones de autenticación
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  birthDate: string; // ISO string format
  password: string;
  photo?: string;
  accountType?: 'user' | 'business';
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  birthDate?: string;
  photo?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Tipo para la respuesta del usuario
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  photo: string;
  accountType: 'user' | 'business';
  createdAt: string;
  updatedAt: string;
}

// Tipo para las respuestas de autenticación
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    console.log('🔐 AuthService initialized');
  }

  // ✅ NUEVO: Método para obtener el usuario actual
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ✅ NUEVO: Método para establecer el usuario actual
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    console.log('👤 AuthService: Current user set:', user ? user.email : 'null');
  }

  // Registrar usuario
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 AuthService: Starting registration for:', userData.email);
      console.log('📝 AuthService: Registration data:', { ...userData, password: '***' });

      const response = await apiService.post('/auth/register', userData, false);
      console.log('📝 AuthService: Registration API response:', response);

      if (response.success && response.data) {
        // Guardar token si viene en la respuesta
        if (response.data.token) {
          console.log('🔑 AuthService: Saving token from registration');
          await apiService.saveToken(response.data.token);
        }

        // ✅ NUEVO: Guardar el usuario actual
        const user = response.data.user || response.data;
        this.setCurrentUser(user);

        const result = {
          success: true,
          message: response.message || 'Usuario registrado exitosamente',
          user: user,
          token: response.data.token
        };

        console.log('✅ AuthService: Registration successful:', result);
        return result;
      }

      const errorResult = {
        success: false,
        message: response.message || 'Error al registrar usuario'
      };

      console.log('❌ AuthService: Registration failed:', errorResult);
      return errorResult;

    } catch (error) {
      console.error('❌ AuthService: Register error:', error);
      return {
        success: false,
        message: 'Error de conexión durante el registro'
      };
    }
  }

  // Iniciar sesión
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      console.log('🔑 AuthService: Starting login for:', credentials.email);

      const response = await apiService.post('/auth/login', credentials, false);
      console.log('🔑 AuthService: Login API response:', response);

      if (response.success && response.data) {
        // Guardar token
        if (response.data.token) {
          console.log('🔑 AuthService: Saving token from login');
          await apiService.saveToken(response.data.token);
        }

        // ✅ ACTUALIZADO: Guardar el usuario actual
        const user = response.data.user || response.data;
        this.setCurrentUser(user);

        const result = {
          success: true,
          message: response.message || 'Login exitoso',
          user: user,
          token: response.data.token
        };

        console.log('✅ AuthService: Login successful:', result);
        return result;
      }

      const errorResult = {
        success: false,
        message: response.message || 'Credenciales inválidas'
      };

      console.log('❌ AuthService: Login failed:', errorResult);
      return errorResult;

    } catch (error) {
      console.error('❌ AuthService: Login error:', error);
      return {
        success: false,
        message: 'Error de conexión durante el login'
      };
    }
  }

  // Validar token actual
  async validateToken(): Promise<AuthResponse> {
    try {
      console.log('🔍 AuthService: Starting token validation');

      const response = await apiService.get('/auth/validate');
      console.log('🔍 AuthService: Token validation API response:', response);

      if (response.success && response.data) {
        // ✅ ACTUALIZADO: Guardar el usuario actual
        const user = response.data.user || response.data;
        this.setCurrentUser(user);

        const result = {
          success: true,
          message: 'Token válido',
          user: user
        };

        console.log('✅ AuthService: Token validation successful:', result);
        return result;
      }

      // Token inválido, eliminar del storage
      console.log('❌ AuthService: Invalid token, removing from storage');
      await apiService.removeToken();
      this.setCurrentUser(null); // ✅ NUEVO: Limpiar usuario actual
      
      const errorResult = {
        success: false,
        message: 'Token inválido'
      };

      console.log('❌ AuthService: Token validation failed:', errorResult);
      return errorResult;

    } catch (error) {
      console.error('❌ AuthService: Token validation error:', error);
      await apiService.removeToken();
      this.setCurrentUser(null); // ✅ NUEVO: Limpiar usuario actual
      return {
        success: false,
        message: 'Error al validar token'
      };
    }
  }

  // Obtener perfil del usuario
  async getProfile(): Promise<AuthResponse> {
    try {
      console.log('👤 AuthService: Getting user profile');

      const response = await apiService.get('/auth/profile');
      console.log('👤 AuthService: Get profile API response:', response);

      if (response.success && response.data) {
        // ✅ NUEVO: Actualizar el usuario actual
        const user = response.data.user || response.data;
        this.setCurrentUser(user);

        const result = {
          success: true,
          message: 'Perfil obtenido exitosamente',
          user: user
        };

        console.log('✅ AuthService: Get profile successful:', result);
        return result;
      }

      const errorResult = {
        success: false,
        message: response.message || 'Error al obtener perfil'
      };

      console.log('❌ AuthService: Get profile failed:', errorResult);
      return errorResult;

    } catch (error) {
      console.error('❌ AuthService: Get profile error:', error);
      return {
        success: false,
        message: 'Error al obtener perfil'
      };
    }
  }

  // Actualizar perfil
  async updateProfile(profileData: UpdateProfileData): Promise<AuthResponse> {
    try {
      console.log('📝 AuthService: Updating profile with data:', profileData);

      const response = await apiService.put('/auth/profile', profileData);
      console.log('📝 AuthService: Update profile API response:', response);

      if (response.success && response.data) {
        // ✅ NUEVO: Actualizar el usuario actual
        const user = response.data.user || response.data;
        this.setCurrentUser(user);

        const result = {
          success: true,
          message: response.message || 'Perfil actualizado exitosamente',
          user: user
        };

        console.log('✅ AuthService: Update profile successful:', result);
        return result;
      }

      const errorResult = {
        success: false,
        message: response.message || 'Error al actualizar perfil'
      };

      console.log('❌ AuthService: Update profile failed:', errorResult);
      return errorResult;

    } catch (error) {
      console.error('❌ AuthService: Update profile error:', error);
      return {
        success: false,
        message: 'Error al actualizar perfil'
      };
    }
  }

  // Cambiar contraseña
  async changePassword(passwordData: ChangePasswordData): Promise<AuthResponse> {
    try {
      console.log('🔒 AuthService: Changing password');

      const response = await apiService.put('/auth/change-password', passwordData);
      console.log('🔒 AuthService: Change password API response:', response);

      const result = {
        success: response.success,
        message: response.message || (response.success ? 'Contraseña actualizada' : 'Error al cambiar contraseña')
      };

      console.log('🔒 AuthService: Change password result:', result);
      return result;

    } catch (error) {
      console.error('❌ AuthService: Change password error:', error);
      return {
        success: false,
        message: 'Error al cambiar contraseña'
      };
    }
  }

  // Cerrar sesión
  async logout(): Promise<AuthResponse> {
    try {
      console.log('🚪 AuthService: Starting logout');

      // Intentar hacer logout en el servidor (opcional)
      await apiService.post('/auth/logout');
      console.log('🚪 AuthService: Server logout completed');
      
      // Eliminar token del storage
      await apiService.removeToken();
      console.log('🚪 AuthService: Token removed from storage');

      // ✅ NUEVO: Limpiar usuario actual
      this.setCurrentUser(null);

      const result = {
        success: true,
        message: 'Logout exitoso'
      };

      console.log('✅ AuthService: Logout successful:', result);
      return result;

    } catch (error) {
      console.error('❌ AuthService: Logout error:', error);
      // Aunque falle el logout del servidor, eliminar token local
      await apiService.removeToken();
      this.setCurrentUser(null); // ✅ NUEVO: Limpiar usuario actual
      console.log('🚪 AuthService: Token removed from storage (after error)');
      
      return {
        success: true,
        message: 'Logout exitoso'
      };
    }
  }

  // Verificar si hay token guardado
  async hasToken(): Promise<boolean> {
    try {
      console.log('🔍 AuthService: Checking if token exists');
      
      const token = await apiService.getToken();
      const hasToken = !!token;
      
      console.log('🔍 AuthService: Token exists:', hasToken);
      return hasToken;
    } catch (error) {
      console.error('❌ AuthService: Error checking token:', error);
      return false;
    }
  }

  // ✅ NUEVO: Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // ✅ NUEVO: Obtener el ID del usuario actual
  getCurrentUserId(): string | null {
    return this.currentUser?._id || null;
  }

  // ✅ NUEVO: Verificar si el usuario actual es business
  isBusinessAccount(): boolean {
    return this.currentUser?.accountType === 'business';
  }

  // ✅ NUEVO: Inicializar usuario desde token guardado (para cuando la app se abre)
  async initializeFromToken(): Promise<boolean> {
    try {
      console.log('🔄 AuthService: Initializing from stored token');
      
      const hasToken = await this.hasToken();
      if (!hasToken) {
        console.log('🔄 AuthService: No token found');
        return false;
      }

      const response = await this.validateToken();
      if (response.success && response.user) {
        console.log('🔄 AuthService: Successfully initialized from token');
        return true;
      }

      console.log('🔄 AuthService: Failed to initialize from token');
      return false;
    } catch (error) {
      console.error('❌ AuthService: Error initializing from token:', error);
      return false;
    }
  }
}

// Instancia singleton
export const authService = new AuthService();
export default AuthService;