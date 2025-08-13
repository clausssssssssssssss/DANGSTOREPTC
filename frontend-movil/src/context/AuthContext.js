// frontend-movil/src/context/AuthContext.js
import React, { createContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native';

const AuthContext = createContext(null);
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ajusta aquí tu IP y puerto del backend
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.8:4000';

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setAuthToken(token);
      }
    };
    loadToken();
  }, []);

  const clearSession = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
    setAuthToken(null);
  };

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await clearSession();
      ToastAndroid.show('Sesión cerrada correctamente', ToastAndroid.SHORT);
    }
  }, [API_URL]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText} - ${errText}`);
      }
      if (!contentType.includes('application/json')) {
        const txt = await response.text();
        throw new Error(`Respuesta no JSON: ${txt.slice(0, 200)}`);
      }
      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        setAuthToken(data.token);
        setUser(data.userName);
        ToastAndroid.show('Inicio de sesión exitoso', ToastAndroid.SHORT);
        return true;
      } else {
        ToastAndroid.show(data.message || 'Error al iniciar sesión', ToastAndroid.SHORT);
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      ToastAndroid.show('Error de conexión con el servidor', ToastAndroid.SHORT);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        ToastAndroid.show('Cuenta registrada correctamente.', ToastAndroid.SHORT);
        return true;
      } else {
        const data = await response.json();
        ToastAndroid.show(data.message || 'Error al registrar', ToastAndroid.SHORT);
        return false;
      }
    } catch (error) {
      console.error('Error durante el registro:', error);
      ToastAndroid.show('Error de conexión al registrar.', ToastAndroid.SHORT);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        loading,
        login,
        logout,
        register,
        API: API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


