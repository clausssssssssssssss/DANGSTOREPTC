// Utilidades para manejo de autenticación
export const clearExpiredAuth = () => {
  // Limpiar token expirado
  localStorage.removeItem('token');
  
  // Limpiar otros datos de sesión si existen
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  localStorage.removeItem('favorites');
  
  console.log('🔐 Sesión expirada limpiada. Por favor, inicia sesión nuevamente.');
};

export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Verificar si el token tiene el formato correcto
    if (token.split('.').length !== 3) return false;
    
    // Aquí podrías agregar más validaciones del token
    return true;
  } catch (error) {
    return false;
  }
};

export const handleAuthError = (error) => {
  if (error.message.includes('401') || 
      error.message.includes('Token inválido') || 
      error.message.includes('expirado')) {
    clearExpiredAuth();
    return true; // Error manejado
  }
  return false; // Error no manejado
};
