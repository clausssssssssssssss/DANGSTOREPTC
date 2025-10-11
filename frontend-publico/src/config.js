// Configuración central de la aplicación
export const config = {
  // URL del servidor de desarrollo local
  API_BASE_URL: 'http://localhost:4000/api',
  
  // URL del servidor de producción (para cuando se despliegue)
  PRODUCTION_API_URL: 'https://dangstoreptc.onrender.com/api',
  
  // Determinar qué URL usar basado en el entorno
  getApiUrl: () => {
    // En desarrollo, usar localhost
    if (import.meta.env.DEV) {
      return 'http://localhost:4000/api';
    }
    
    // En producción, usar la URL de producción
    return 'https://dangstoreptc.onrender.com/api';
  }
};

// Exportar la URL por defecto
export const API_BASE = config.getApiUrl();
