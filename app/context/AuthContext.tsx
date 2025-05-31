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
      
      // Get stored user data
      const currentUser = AuthService.getCurrentUser();
      
      if (currentUser && AuthService.getToken()) {
        // Validate token and refresh user data
        const isValid = await AuthService.validateToken();
        
        if (isValid) {
          const profileResponse = await AuthService.getUserProfile();
          if (profileResponse.success && profileResponse.user) {
            setUser(profileResponse.user);
          } else {
            // Token invalid, clear auth data
            await AuthService.logout();
            setUser(null);
          }
        } else {
          // Token invalid, clear auth data
          await AuthService.logout();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginData: LoginData): Promise<AuthResponse> => {
    const response = await AuthService.login(loginData);
    
    if (response.success && response.user) {
      setUser(response.user);
    }
    
    return response;
  };

  const register = async (registerData: RegisterData): Promise<AuthResponse> => {
    const response = await AuthService.register(registerData);
    
    if (response.success && response.user) {
      setUser(response.user);
    }
    
    return response;
  };

  const logout = async (): Promise<void> => {
    await AuthService.logout();
    setUser(null);
  };

  const updateProfile = async (updateData: Partial<RegisterData>): Promise<AuthResponse> => {
    const response = await AuthService.updateProfile(updateData);
    
    if (response.success && response.user) {
      setUser(response.user);
    }
    
    return response;
  };

  const refreshProfile = async (): Promise<void> => {
    if (AuthService.isAuthenticated()) {
      const response = await AuthService.getUserProfile();
      if (response.success && response.user) {
        setUser(response.user);
      }
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