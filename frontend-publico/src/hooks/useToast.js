import { useCallback } from 'react';

/**
 * Hook sencillo para mostrar un toast.
 * Por defecto usa alert(), pero puedes reemplazarlo con una UI real.
 */
export const useToast = () => {
  const showToast = useCallback((message) => {
    alert(message);
  }, []);

  return { showToast };
};
