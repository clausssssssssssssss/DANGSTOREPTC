// Configuración centralizada de la API
// Cambiar estas URLs según el entorno (desarrollo/producción)

const ENV_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_CONFIG = {
  
  // URL base para producción
  PRODUCTION: 'https://dangstoreptc-production.up.railway.app/api',
  
  // URL actualmente activa (puede sobreescribirse con EXPO_PUBLIC_API_URL)
  BASE_URL: ENV_URL || 'https://dangstoreptc-production.up.railway.app/api',
};

// Endpoints específicos
export const ENDPOINTS = {
  MATERIALS: '/material',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  SALES: '/sales',
  CUSTOMERS: '/customers',
  ADMINS: '/admins',
  NOTIFICATIONS: '/notifications',
  CUSTOM_ORDERS: '/custom-orders',
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función para cambiar entre entornos
export const setEnvironment = (isProduction = false) => {
  API_CONFIG.BASE_URL = isProduction ? API_CONFIG.PRODUCTION : API_CONFIG.LOCAL;
  console.log(`API configurada para: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
  console.log(`URL base: ${API_CONFIG.BASE_URL}`);
};

export const logCurrentApiBaseUrl = () => {
  const effective = API_CONFIG.BASE_URL;
  console.log(`API base efectiva: ${effective}`);
  if (ENV_URL) {
    console.log('EXPO_PUBLIC_API_URL detectada y usada.');
  }
};
