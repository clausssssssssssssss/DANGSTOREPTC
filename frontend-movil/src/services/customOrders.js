// Servicio simple para órdenes personalizadas
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base del backend - debe coincidir con AuthContext
const API_URL = 'https://dangstoreptc.onrender.com/api';

// Función helper para hacer peticiones autenticadas
const authenticatedFetch = async (url, options = {}) => {
  const token = await AsyncStorage.getItem('authToken');
  
  console.log('Token obtenido:', token ? 'SÍ' : 'NO');
  console.log(' URL solicitada:', `${API_URL}${url}`);
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log(' Token enviado en headers');
  } else {
    console.log(' No hay token disponible');
  }

  console.log(' Headers enviados:', headers);

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
};

// Servicios para órdenes personalizadas
export const customOrdersAPI = {
  // Obtener todas las órdenes pendientes (admin)
  getPendingOrders: async () => {
    try {
      const response = await authenticatedFetch('/custom-orders/pending');
      if (response.ok) {
        const result = await response.json();
        console.log('Respuesta completa del API:', result);
        
        // Verificar que la respuesta tenga el formato esperado
        if (result.success && Array.isArray(result.data)) {
          console.log('Órdenes extraídas correctamente:', result.data.length);
          return result.data;
        } else {
          console.error('Formato de respuesta inesperado:', result);
          throw new Error('Formato de respuesta inesperado del servidor');
        }
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
        const result = await response.json();
        console.log('Respuesta de cotización:', result);
        
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.message || 'Error desconocido en la cotización');
        }
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
        const result = await response.json();
        console.log('Respuesta de rechazo:', result);
        
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.message || 'Error desconocido al rechazar la orden');
        }
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
  
  // Si es base64, devolverlo directamente
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Construir URL completa para archivos del servidor
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_URL.replace('/api', '')}${cleanPath}`;
};
