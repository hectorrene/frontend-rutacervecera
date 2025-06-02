// config/api.ts
import { Platform } from 'react-native';

// ✅ Configuración unificada para todas las plataformas
export const API_CONFIG = {
  BASE_URL: Platform.select({
    // Para Expo Web (desarrollo)
    web: 'http://192.168.100.191:3000/api',
    // Para dispositivo iOS
    ios: 'http://192.168.100.191:3000/api',
    // Para emulador Android
    android: 'http://10.0.2.2:3000/api',
    // Default para otras plataformas
    default: 'http://192.168.100.191:3000/api'
  }),
  TIMEOUT: 15000,
};

// Si estás usando Expo web, también puedes detectar si es web específicamente:
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    // En desarrollo web, usar localhost o la IP local
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api'
      : 'http://192.168.100.191:3000/api';
  }
  
  return Platform.select({
    ios: 'http://192.168.100.191:3000/api',
    android: 'http://10.0.2.2:3000/api',
    default: 'http://192.168.100.191:3000/api'
  });
};

export const API_BASE_URL = getApiUrl();