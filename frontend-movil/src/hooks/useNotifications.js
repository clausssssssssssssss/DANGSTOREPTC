import { useContext } from 'react';
import { NotificationsContext } from '../context/NotificationsContext';

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationsProvider');
  }
  
  // Agrega función para crear notificación localmente
  const addNotification = (notification) => {
    if (typeof context.setNotifications === 'function') {
      context.setNotifications(prev => [
        {
          _id: Math.random().toString(36).substr(2, 9),
          ...notification,
          isRead: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
      if (typeof context.setUnreadCount === 'function') {
        context.setUnreadCount(prev => prev + 1);
      }
    }
  };

  return {
    ...context,
    addNotification
  };
};

export default useNotifications;