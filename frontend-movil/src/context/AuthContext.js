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
  const [savedCredentials, setSavedCredentials] = useState(null);

  const API_URL = "http://10.10.2.33:4000/api";

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [token, credentials] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('savedCredentials')
        ]);
        
        if (token) {
          setAuthToken(token);
        }
        
        if (credentials) {
          setSavedCredentials(JSON.parse(credentials));
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };
    loadStoredData();
  }, []);

  const clearSession = async () => {
    await AsyncStorage.removeItem('authToken');
    setUser(null);
    setAuthToken(null);
  };

  const saveCredentials = async (email, password) => {
    try {
      const credentials = { email, password };
      await AsyncStorage.setItem('savedCredentials', JSON.stringify(credentials));
      setSavedCredentials(credentials);
      ToastAndroid.show('Usuario guardado', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error saving credentials:', error);
      ToastAndroid.show('Error al guardar usuario', ToastAndroid.SHORT);
    }
  };

  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem('savedCredentials');
      setSavedCredentials(null);
      ToastAndroid.show('Usuario eliminado', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error clearing credentials:', error);
      ToastAndroid.show('Error al eliminar usuario', ToastAndroid.SHORT);
    }
  };

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await clearSession();
      ToastAndroid.show('Sesión cerrada correctamente', ToastAndroid.SHORT);
    }
  }, [API_URL, authToken]);

  // Función para decodificar JWT
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return {};
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch(`${API_URL}/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type') || '';
      
      // Manejar específicamente el error 401 (credenciales inválidas)
      if (response.status === 401) {
        const errorData = await response.json();
        ToastAndroid.show(errorData.message || 'Credenciales inválidas', ToastAndroid.SHORT);
        return false;
      }
      
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
        await AsyncStorage.setItem('authToken', data.token);
        setAuthToken(data.token);
        setUser(data.user || { email: data.email, userType: data.userType });
        
        // Guardar credenciales si se marca "Recordar mi usuario"
        if (rememberMe) {
          await saveCredentials(email, password);
        }
        
        ToastAndroid.show('Inicio de sesión exitoso', ToastAndroid.SHORT);
        return true;
      } else {
        ToastAndroid.show(data.message || 'Error al iniciar sesión', ToastAndroid.SHORT);
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      
      // Mostrar mensaje de error específico solo si no es un error 401 (que ya manejamos arriba)
      if (!error.message.includes('401')) {
        ToastAndroid.show('Error de conexión con el servidor', ToastAndroid.SHORT);
      }
      
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/customers`, {
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
        setUser,
        authToken,
        loading,
        savedCredentials,
        login,
        logout,
        register,
        parseJwt,
        saveCredentials,
        clearSavedCredentials,
        API: API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};