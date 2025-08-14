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

  // URL base unificada con el servicio API del móvil
  const API_URL = "http://192.168.0.8:4000/api"

  // Clave de almacenamiento local para datos del perfil del admin
  const ADMIN_PROFILE_KEY = '@admin_profile';

  useEffect(() => {
    const loadToken = async () => {
      const token = await getAuthToken();
      if (token) {
        setAuthToken(token);
      }
    };
    loadToken();
  }, []);

  // Utilidades de token en almacenamiento local
  const AUTH_TOKEN_KEY = '@auth_token';
  const saveAuthToken = async (token) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (err) {
      console.error('saveAuthToken error:', err);
    }
  };
  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (err) {
      console.error('getAuthToken error:', err);
      return null;
    }
  };
  const removeAuthToken = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (err) {
      console.error('removeAuthToken error:', err);
    }
  };

  // Carga el perfil del admin guardado localmente
  const loadAdminProfile = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(ADMIN_PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Error loading admin profile from storage:', err);
      return null;
    }
  }, []);

  const clearSession = async () => {
    await removeAuthToken();
    setUser(null);
    setAuthToken(null);
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

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials:  "include",
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
        await saveAuthToken(data.token);
        setAuthToken(data.token);

        // mezclar datos locales del perfil (si existen)
        const localProfile = await loadAdminProfile();
        setUser({ ...data.user, ...(localProfile || {}) });
        // Obtiene el perfil del backend (si existiera) y sincroniza
        try {
          const profRes = await fetch(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          if (profRes.ok) {
            const prof = await profRes.json();
            setUser((prev) => ({ ...(prev || {}), ...prof }));
          }
        } catch (e) {
          // ignora fallo de perfil
        }
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

  // Actualiza y persiste localmente el perfil del admin (nombre, email, foto)
  const updateAdminProfile = useCallback(async (partialProfile) => {
    try {
      // Normaliza email si viene en el payload
      const normalized = {
        ...partialProfile,
        ...(partialProfile?.email ? { email: String(partialProfile.email).toLowerCase() } : {}),
      };

      const nextUser = { ...(user || {}), ...normalized };
      setUser(nextUser);
      await AsyncStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify({
        name: nextUser.name || '',
        email: nextUser.email || '',
        profileImage: nextUser.profileImage || '',
      }));
      // Intenta persistir en backend
      try {
        await fetch(`${API_URL}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            name: nextUser.name,
            email: nextUser.email,
            profileImage: nextUser.profileImage,
            contactEmail: nextUser.email,
          }),
        });
      } catch (e) {
        // si falla, queda guardado localmente
      }
      ToastAndroid.show('Perfil actualizado', ToastAndroid.SHORT);
      return true;
    } catch (err) {
      console.error('Error saving admin profile:', err);
      ToastAndroid.show('No se pudo guardar el perfil', ToastAndroid.SHORT);
      return false;
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        loading,
        login,
        logout,
        register,
        updateAdminProfile,
        API: API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


