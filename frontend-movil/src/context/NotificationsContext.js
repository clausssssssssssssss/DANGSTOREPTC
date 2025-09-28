import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://dangstoreptc-production.up.railway.app/api';

const NotificationsContext = createContext(null);
export { NotificationsContext };

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Obtener token de autenticación
  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
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
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications`, { headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        const unreadCount = data.data.filter(notification => !notification.isRead).length;
        setUnreadCount(unreadCount);
      } else {
        throw new Error(data.message || 'Error desconocido');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Marcar como leída
  const markAsRead = async (notificationId) => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          );
          const unreadCount = updated.filter(notification => !notification.isRead).length;
          setUnreadCount(unreadCount);
          return updated;
        });
        return true;
      } else {
        throw new Error('Error marcando como leída');
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.map(notif => ({ ...notif, isRead: true }));
          setUnreadCount(0);
          return updated;
        });
        return true;
      } else {
        throw new Error('Error marcando todas como leídas');
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId) => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.filter(notif => notif._id !== notificationId);
          const unreadCount = updated.filter(notification => !notification.isRead).length;
          setUnreadCount(unreadCount);
          return updated;
        });
        return true;
      } else {
        throw new Error('Error eliminando notificación');
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Eliminar todas las notificaciones
  const deleteAllNotifications = async () => {
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
      return false;
    }
  };

  // Refrescar datos
  const refresh = async () => {
    await fetchNotifications();
  };

  // Limpiar error después de un tiempo
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return (
    <NotificationsContext.Provider
      value={{
        // Data
        notifications,
        unreadCount,
        loading,
        error,
        
        // Actions
        fetchNotifications,
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
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};