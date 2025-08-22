import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI, notificationSocket } from '../services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(notification => !notification.read).length);
      setError(null);
    } catch (err) {
      setError('Error al cargar notificaciones');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar como leída
  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      // Actualizar contador si la notificación no estaba leída
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  // Eliminar todas las notificaciones
  const deleteAllNotifications = async () => {
    try {
      await notificationsAPI.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      throw err;
    }
  };

  // Configurar WebSocket para notificaciones en tiempo real
  useEffect(() => {
    let removeListener = null;

    const setupWebSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          notificationSocket.connect(token);
          
          // Escuchar cambios de conexión
          const originalOnOpen = notificationSocket.socket.onopen;
          notificationSocket.socket.onopen = () => {
            setSocketConnected(true);
            if (originalOnOpen) originalOnOpen();
          };
          
          const originalOnClose = notificationSocket.socket.onclose;
          notificationSocket.socket.onclose = () => {
            setSocketConnected(false);
            if (originalOnClose) originalOnClose();
          };
          
          // Escuchar nuevas notificaciones
          removeListener = notificationSocket.onNotification((data) => {
            if (data.type === 'new_notification') {
              setNotifications(prev => [data.notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          });
        }
      } catch (err) {
        console.error('Error setting up notification WebSocket:', err);
      }
    };

    setupWebSocket();

    return () => {
      if (removeListener) removeListener();
      notificationSocket.disconnect();
    };
  }, []);

  // Cargar notificaciones al inicializar
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    socketConnected,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refresh: loadNotifications
  };
};