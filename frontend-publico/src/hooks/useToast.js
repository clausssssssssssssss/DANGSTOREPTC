import { useCallback, useState } from 'react';

/**
 * Hook para mostrar toasts con diferentes tipos y duración
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    return addToast(message, type, duration);
  }, [addToast]);

  const showSuccess = useCallback((message, duration = 5000) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration = 5000) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration = 5000) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration = 5000) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast
  };
};
