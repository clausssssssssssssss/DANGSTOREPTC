// Servicio de API para conectar con el backend
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

// Detecta el origen del backend según la plataforma/emulador
// - Android (AVD): 10.0.2.2
// - iOS simulator / Web: localhost
// - Permite override con EXPO_PUBLIC_API_ORIGIN
const getHostFromDevServer = () => {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (!scriptURL) return null;
    const url = new URL(scriptURL);
    return url.hostname; // IP del host que sirve el bundle de Metro
  } catch {
    return null;
  }
};

const resolveApiOrigin = () => {
  const override = process.env?.EXPO_PUBLIC_API_ORIGIN;
  if (override && typeof override === 'string' && override.length > 0) {
    return override.replace(/\/$/, '');
  }

  const host = getHostFromDevServer();
  if (host) {
    return `http://${host}:3001`;
  }

  if (Platform.OS === 'android') return 'http://10.10.0.253:3001';
  return 'http://10.10.0.253:3001';
};

export const API_ORIGIN = resolveApiOrigin();
export const API_BASE_URL = `${API_ORIGIN}/api`;

// Almacenar el token en AsyncStorage
export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

// Obtener el token de AsyncStorage
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Eliminar el token de AsyncStorage
export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// Realizar petición con autenticación
export const authenticatedFetch = async (url, options = {}) => {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
};

// Login de administrador usando las credenciales del backend (.env)
export const loginAdmin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admins/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    if (data?.token) {
      await setAuthToken(data.token);
    }

    return data; // { message, token, user }
  } catch (error) {
    console.error('Error en loginAdmin:', error);
    throw error;
  }
};

// Cerrar sesión
export const logout = async () => {
  await removeAuthToken();
};

// Servicios específicos para órdenes personalizadas
export const customOrdersAPI = {
  // Obtener todas las órdenes pendientes (admin)
  getPendingOrders: async () => {
    try {
      const response = await authenticatedFetch('/custom-orders/pending');
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw error;
    }
  },

  // Cotizar una orden (admin)
  quoteOrder: async (orderId, price, comment) => {
    try {
      const response = await authenticatedFetch(`/custom-orders/${orderId}/quote`, {
        method: 'PUT',
        body: JSON.stringify({
          price: parseFloat(price),
          comment: comment?.trim() || '',
        }),
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Error submitting quote:', error);
      throw error;
    }
  },

  // Rechazar una orden (admin)
  rejectOrder: async (orderId, comment) => {
    try {
      const response = await authenticatedFetch(`/custom-orders/${orderId}/quote`, {
        method: 'PUT',
        body: JSON.stringify({
          price: 0,
          comment: comment?.trim() || 'Orden rechazada',
          status: 'rejected',
        }),
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Error rejecting order:', error);
      throw error;
    }
  },
};

// Construir URL completa para imágenes
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Construir URL completa (usa el origen del servidor, no /api)
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_ORIGIN}${cleanPath}`;
};

export default {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  authenticatedFetch,
  loginAdmin,
  logout,
  customOrdersAPI,
  getImageUrl,
  API_BASE_URL,
  API_ORIGIN,
};
