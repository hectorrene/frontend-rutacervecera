import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { AuthResponse, authService, ChangePasswordData, LoginData, RegisterData, UpdateProfileData, User } from '../services/AuthService';

// Tipos para el estado de autenticación
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

// Tipos para las acciones del reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_FAILURE'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { user: User } }
  | { type: 'CLEAR_ERROR' };

// Tipos para el contexto
interface AuthContextType {
  // Estado
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  
  // Métodos
  login: (credentials: LoginData) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (profileData: UpdateProfileData) => Promise<AuthResponse>;
  changePassword: (passwordData: ChangePasswordData) => Promise<AuthResponse>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  getCurrentUser: () => User | null;
}

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // Inicia en true para verificar token existente
  user: null,
  error: null,
};

// Variable global para almacenar el usuario actual (accessible from anywhere)
let globalCurrentUser: User | null = null;

// Reducer para manejar el estado de autenticación
function authReducer(state: AuthState, action: AuthAction): AuthState {
  console.log('🔄 AuthContext: Reducer action:', action.type, action);
  console.log('🔄 AuthContext: Current state before action:', state);

  let newState: AuthState;

  switch (action.type) {
    case 'AUTH_START':
      newState = {
        ...state,
        isLoading: true,
        error: null,
      };
      break;

    case 'AUTH_SUCCESS':
      newState = {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        error: null,
      };
      // Update global user reference
      globalCurrentUser = action.payload.user;
      break;

    case 'AUTH_FAILURE':
      newState = {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload.error,
      };
      // Clear global user reference
      globalCurrentUser = null;
      break;

    case 'AUTH_LOGOUT':
      newState = {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      };
      // Clear global user reference
      globalCurrentUser = null;
      break;

    case 'UPDATE_USER':
      newState = {
        ...state,
        user: action.payload.user,
        error: null,
      };
      // Update global user reference
      globalCurrentUser = action.payload.user;
      break;

    case 'CLEAR_ERROR':
      newState = {
        ...state,
        error: null,
      };
      break;

    default:
      console.log('⚠️ AuthContext: Unknown action type:', action);
      newState = state;
  }

  console.log('🔄 AuthContext: New state after action:', newState);
  return newState;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🚀 AuthContext: AuthProvider rendering');
  
  const [state, dispatch] = useReducer(authReducer, initialState);

  console.log('📊 AuthContext: Current state:', state);

  // Verificar token existente al iniciar la app
  useEffect(() => {
    console.log('🔄 AuthContext: useEffect triggered - checking existing auth');
    checkExistingAuth();
  }, []);

  // Verificar si hay un token válido guardado
  const checkExistingAuth = async () => {
    try {
      console.log('🔍 AuthContext: Starting checkExistingAuth');
      dispatch({ type: 'AUTH_START' });

      console.log('🔍 AuthContext: Checking if token exists...');
      const hasToken = await authService.hasToken();
      console.log('🔍 AuthContext: Has token result:', hasToken);

      if (!hasToken) {
        console.log('❌ AuthContext: No token found, setting AUTH_FAILURE');
        dispatch({ type: 'AUTH_FAILURE', payload: { error: 'No token found' } });
        return;
      }

      console.log('🔍 AuthContext: Token exists, validating...');
      const response = await authService.validateToken();
      console.log('🔍 AuthContext: Token validation response:', response);

      if (response.success && response.user) {
        console.log('✅ AuthContext: Token validation successful, setting AUTH_SUCCESS');
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.user } });
      } else {
        console.log('❌ AuthContext: Token validation failed, setting AUTH_FAILURE');
        dispatch({ type: 'AUTH_FAILURE', payload: { error: response.message || 'Token inválido' } });
      }
    } catch (error) {
      console.error('❌ AuthContext: Error in checkExistingAuth:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: { error: 'Error al verificar autenticación' } });
    }
  };

  // Función de login
  const login = async (credentials: LoginData): Promise<AuthResponse> => {
    try {
      console.log('🔑 AuthContext: Starting login for:', credentials.email);
      dispatch({ type: 'AUTH_START' });

      const response = await authService.login(credentials);
      console.log('🔑 AuthContext: Login response:', response);

      if (response.success && response.user) {
        console.log('✅ AuthContext: Login successful, setting AUTH_SUCCESS');
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.user } });
      } else {
        console.log('❌ AuthContext: Login failed, setting AUTH_FAILURE');
        dispatch({ type: 'AUTH_FAILURE', payload: { error: response.message } });
      }

      return response;
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      const errorMessage = 'Error durante el login';
      dispatch({ type: 'AUTH_FAILURE', payload: { error: errorMessage } });
      return { success: false, message: errorMessage };
    }
  };

  // Función de registro
  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('📝 AuthContext: Starting registration for:', userData.email);
      dispatch({ type: 'AUTH_START' });

      const response = await authService.register(userData);
      console.log('📝 AuthContext: Registration response:', response);

      if (response.success && response.user) {
        console.log('✅ AuthContext: Registration successful, setting AUTH_SUCCESS');
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.user } });
      } else {
        console.log('❌ AuthContext: Registration failed, setting AUTH_FAILURE');
        dispatch({ type: 'AUTH_FAILURE', payload: { error: response.message } });
      }

      return response;
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error);
      const errorMessage = 'Error durante el registro';
      dispatch({ type: 'AUTH_FAILURE', payload: { error: errorMessage } });
      return { success: false, message: errorMessage };
    }
  };

  // Función de logout
  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 AuthContext: Starting logout');
      await authService.logout();
      console.log('✅ AuthContext: Logout successful, setting AUTH_LOGOUT');
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('❌ AuthContext: Error during logout:', error);
      // Aunque falle, hacer logout local
      console.log('🚪 AuthContext: Forcing local logout despite error');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Actualizar perfil
  const updateProfile = async (profileData: UpdateProfileData): Promise<AuthResponse> => {
    try {
      console.log('📝 AuthContext: Updating profile with:', profileData);
      const response = await authService.updateProfile(profileData);
      console.log('📝 AuthContext: Update profile response:', response);

      if (response.success && response.user) {
        console.log('✅ AuthContext: Profile update successful, updating user');
        dispatch({ type: 'UPDATE_USER', payload: { user: response.user } });
      }

      return response;
    } catch (error) {
      console.error('❌ AuthContext: Update profile error:', error);
      const errorMessage = 'Error al actualizar perfil';
      return { success: false, message: errorMessage };
    }
  };

  // Cambiar contraseña
  const changePassword = async (passwordData: ChangePasswordData): Promise<AuthResponse> => {
    try {
      console.log('🔒 AuthContext: Changing password');
      const response = await authService.changePassword(passwordData);
      console.log('🔒 AuthContext: Change password response:', response);
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Change password error:', error);
      const errorMessage = 'Error al cambiar contraseña';
      return { success: false, message: errorMessage };
    }
  };

  // Refrescar información del usuario
  const refreshUser = async (): Promise<void> => {
    try {
      console.log('🔄 AuthContext: Refreshing user data');
      const response = await authService.getProfile();
      console.log('🔄 AuthContext: Refresh user response:', response);
      
      if (response.success && response.user) {
        console.log('✅ AuthContext: User refresh successful, updating user');
        dispatch({ type: 'UPDATE_USER', payload: { user: response.user } });
      }
    } catch (error) {
      console.error('❌ AuthContext: Error refreshing user:', error);
    }
  };

  // Obtener usuario actual
  const getCurrentUser = (): User | null => {
    console.log('👤 AuthContext: Getting current user:', state.user);
    return state.user;
  };

  // Limpiar errores
  const clearError = () => {
    console.log('🧹 AuthContext: Clearing error');
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Valor del contexto
  const contextValue: AuthContextType = {
    // Estado
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    error: state.error,
    
    // Métodos
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    refreshUser,
    getCurrentUser,
  };

  console.log('📊 AuthContext: Providing context value:', {
    isAuthenticated: contextValue.isAuthenticated,
    isLoading: contextValue.isLoading,
    hasUser: !!contextValue.user,
    error: contextValue.error
  });

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

// Función helper para obtener el usuario actual desde fuera del contexto de React
export const getCurrentUserGlobal = (): User | null => {
  console.log('👤 AuthContext: Getting global current user:', globalCurrentUser);
  return globalCurrentUser;
};

// Exportaciones
export default AuthContext;