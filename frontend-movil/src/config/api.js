// Configuración centralizada de la API
// Cambiar estas URLs según el entorno (desarrollo/producción)

export const API_CONFIG = {
  // URL base para desarrollo local
  LOCAL: 'http://192.168.0.9:4000/api',
  
  // URL base para producción
  PRODUCTION: 'https://dangstoreptc.onrender.com/api',
  
  // URL actualmente activa (cambiar según el entorno)
  BASE_URL: 'http://192.168.0.9:4000/api', // Cambiar a PRODUCTION para producción
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
