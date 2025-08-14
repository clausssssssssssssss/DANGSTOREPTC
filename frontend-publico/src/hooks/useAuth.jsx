import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Aquí usamos función inicializadora de useState
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = parseJwt(token);
    if (!decoded) {
      localStorage.removeItem('token');
      return null;
    }
    // Ajusta estos campos a tu payload real:
    return { id: decoded.userId ?? decoded.id, name: decoded.name };
  });

  const logout = () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}

// lo exportamos para descodificar el JWT en el login
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json      = decodeURIComponent(atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
