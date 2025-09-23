import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.10.2.33:4000/api'; // URL consistente con AuthContext

export const useNotifications = (autoRefresh = 30000) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Obtener token de autenticación
  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  };

  // Headers para requests
  const getHeaders = async () => {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  // Cargar todas las notificaciones
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications`, { headers });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      } else {
        throw new Error(data.message || 'Error desconocido');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error cargando notificaciones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar conteo de no leídas
  const fetchUnreadCount = useCallback(async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications/unread-count`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (err) {
      console.error('Error cargando conteo no leídas:', err);
    }
  }, []);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        
        // Actualizar conteo
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        return true;
      } else {
        throw new Error('Error marcando como leída');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error marcando como leída:', err);
      return false;
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        
        return true;
      } else {
        throw new Error('Error marcando todas como leídas');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error marcando todas como leídas:', err);
      return false;
    }
  }, []);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        // Encontrar la notificación antes de eliminarla para actualizar conteo
        const notificationToDelete = notifications.find(n => n._id === notificationId);
        
        // Actualizar estado local
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        );
        
        // Actualizar conteo si era no leída
        if (notificationToDelete && !notificationToDelete.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        return true;
      } else {
        throw new Error('Error eliminando notificación');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error eliminando notificación:', err);
      return false;
    }
  }, [notifications]);

  // Eliminar todas las notificaciones
  const deleteAllNotifications = useCallback(async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        return true;
      } else {
        throw new Error('Error eliminando todas las notificaciones');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error eliminando todas:', err);
      return false;
    }
  }, []);

  // Refrescar datos
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchNotifications(),
      fetchUnreadCount()
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Cargar datos iniciales
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, autoRefresh);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount, autoRefresh]);

  // Limpiar error después de un tiempo
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return {
    // Data
    notifications,
    unreadCount,
    loading,
    error,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refresh,
    
    // Utils
    readNotifications: notifications.filter(n => n.isRead),
    unreadNotifications: notifications.filter(n => !n.isRead),
    hasNotifications: notifications.length > 0,
    hasUnread: unreadCount > 0,
  };
};

export default useNotifications;