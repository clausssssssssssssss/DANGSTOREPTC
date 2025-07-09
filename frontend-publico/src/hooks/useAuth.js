// src/hooks/useAuth.js
/**
 * Contexto de autenticación para MERN sin dependencias externas.
 *
 * - Al iniciar sesión, el backend devuelve un JWT que guardamos en localStorage.
 * - Al montar este proveedor, decodificamos el token (sin librerías) para extraer el userId y el nombre.
 * - Exponemos `user` y `setUser` mediante React Context.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

// Función para decodificar el payload de JWT sin librerías
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Creamos el contexto de autenticación
const AuthContext = createContext();

/**
 * AuthProvider envuelve la app y proporciona el objeto `user`.
 */
export function AuthProvider(props) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        // Ajusta estas propiedades según tu payload real
        setUser({ id: decoded.id, name: decoded.name });
      } else {
        localStorage.removeItem('token');
      }
    }
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { user, setUser } },
    props.children
  );
}

/**
 * useAuth: hook para acceder al contexto de autenticación.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
