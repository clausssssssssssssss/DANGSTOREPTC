import { useCallback, useMemo, useState, useEffect } from 'react';
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getHostFromDevServer = () => {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (!scriptURL) return null;
    const url = new URL(scriptURL);
    return url.hostname;
  } catch {
    return null;
  }
};

const resolveApiOrigin = () => {
  const override = process.env?.EXPO_PUBLIC_API_ORIGIN;
  if (override && typeof override === 'string' && override.length > 0) {
    return override.replace(/\/$/, '');
  }

  const host = getHostFromDevServer();
  if (host) {
    return `http://${host}:3001`;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
  return 'http://localhost:3001';
};

export const API_ORIGIN = resolveApiOrigin();
export const API_BASE_URL = `${API_ORIGIN}/api`;

export function useAuth() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('authToken');
        if (stored) setToken(stored);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.message || `HTTP ${res.status}`;
        throw new Error(message);
      }

      if (data?.token) {
        await AsyncStorage.setItem('authToken', data.token);
        setToken(data.token);
      }
      if (data?.user) setUser(data.user);
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading, login, logout]);
  return value;
}

export default useAuth;


