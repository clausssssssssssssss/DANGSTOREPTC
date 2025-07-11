// src/hooks/useAuth.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:4000/api';    


/**
 * Extrae payload de un JWT. Devuelve null si no es válido.
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json      = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  // Inicializa user desde el token, solo una vez
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = parseJwt(token);
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      localStorage.removeItem('token');
      return null;
    }
    // Ajusta estos campos según tu payload
    return { id: decoded.id, name: decoded.name };
  });
  const [loading, setLoading] = useState(true);

  // Función para iniciar sesión (guardamos token y payload en user)
  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    const decoded = parseJwt(token);
    setUser({ id: decoded.id, name: decoded.name });
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // Al montar validamos el token (y opcionalmente pedimos /api/auth/me)
  useEffect(() => {
    async function validate() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Invalid token');
        const { user: freshUser } = await res.json();
        setUser(freshUser);
      } catch (err) {
        console.warn('Token inválido, forzando logout', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    validate();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
