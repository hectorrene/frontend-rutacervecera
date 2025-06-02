import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AuthService, { AuthResponse, LoginData, RegisterData, User } from '../services/AuthService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: LoginData) => Promise<AuthResponse>;
  register: (registerData: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (updateData: Partial<RegisterData>) => Promise<AuthResponse>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Iniciando autenticación...');
      
      // ✅ CRÍTICO: Inicializar AuthService primero
      await AuthService.initialize();
      
      // Obtener datos del usuario después de la inicialización
      const currentUser = AuthService.getCurrentUser();
      const token = AuthService.getToken();
      
      console.log('👤 Usuario almacenado:', currentUser ? 'Encontrado' : 'No encontrado');
      console.log('🔑 Token almacenado:', token ? 'Encontrado' : 'No encontrado');
      
      if (currentUser && token) {
        console.log('✅ Datos de autenticación encontrados');
        
        // Intentar validar token pero con timeout más corto y manejo robusto
        try {
          const validationPromise = AuthService.validateToken();
          const timeoutPromise = new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Validation timeout')), 5000)
          );
          
          const isValid = await Promise.race([validationPromise, timeoutPromise]);
          
          if (isValid) {
            console.log('✅ Token válido');
            setUser(currentUser);
            
            // Intentar refrescar perfil en background (no bloquear la UI)
            AuthService.getUserProfile()
              .then(profileResponse => {
                if (profileResponse.success && profileResponse.user) {
                  console.log('✅ Perfil actualizado en background');
                  setUser(profileResponse.user);
                }
              })
              .catch(error => {
                console.log('⚠️ Error actualizando perfil en background:', error);
                // No hacer nada, mantener el usuario actual
              });
          } else {
            console.log('❌ Token inválido, limpiando datos');
            await AuthService.logout();
            setUser(null);
          }
        } catch (error) {
          console.log('⏱️ Error o timeout en validación, usando datos locales');
          // En caso de error de red, usar datos almacenados temporalmente
          setUser(currentUser);
          
          // Intentar validar en background
          setTimeout(async () => {
            try {
              const isValid = await AuthService.validateToken();
              if (!isValid) {
                console.log('❌ Token inválido detectado en background');
                await AuthService.logout();
                setUser(null);
              }
            } catch (bgError) {
              console.log('⚠️ Error en validación de background:', bgError);
            }
          }, 2000);
        }
      } else {
        console.log('ℹ️ No hay datos de autenticación almacenados');
        setUser(null);
      }
    } catch (error) {
      console.error('💥 Error crítico en inicialización:', error);
      // En caso de error crítico, limpiar todo y continuar
      try {
        await AuthService.logout();
      } catch (logoutError) {
        console.error('Error en logout de emergencia:', logoutError);
      }
      setUser(null);
    } finally {
      console.log('🏁 Inicialización completada');
      setIsLoading(false);
    }
  };

  const login = async (loginData: LoginData): Promise<AuthResponse> => {
    try {
      const response = await AuthService.login(loginData);
      
      if (response.success && response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Error en login del contexto:', error);
      return {
        success: false,
        message: 'Error inesperado en el login'
      };
    }
  };

  const register = async (registerData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await AuthService.register(registerData);
      
      if (response.success && response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Error en register del contexto:', error);
      return {
        success: false,
        message: 'Error inesperado en el registro'
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error en logout del contexto:', error);
      // Forzar limpieza local aunque falle el logout remoto
      setUser(null);
    }
  };

  const updateProfile = async (updateData: Partial<RegisterData>): Promise<AuthResponse> => {
    try {
      const response = await AuthService.updateProfile(updateData);
      
      if (response.success && response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Error en updateProfile del contexto:', error);
      return {
        success: false,
        message: 'Error inesperado actualizando el perfil'
      };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      if (AuthService.isAuthenticated()) {
        const response = await AuthService.getUserProfile();
        if (response.success && response.user) {
          setUser(response.user);
        }
      }
    } catch (error) {
      console.error('Error en refreshProfile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};