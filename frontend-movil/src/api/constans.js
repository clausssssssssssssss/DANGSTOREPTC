// src/api/constants.js
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Lee host de Metro (bundle) o de hostUri
function detectHostFromBundle() {
  const scriptURL = NativeModules?.SourceCode?.scriptURL || '';
  if (scriptURL) {
    try {
      const host = scriptURL.replace(/^https?:\/\//, '')
        .split('/')[0].split(':')[0];
      if (host && !['localhost', '127.0.0.1'].includes(host)) return host;
    } catch {}
  }
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest?.debuggerHost ||
    Constants?.manifest2?.extra?.expoClient?.hostUri ||
    '';
  if (hostUri) return String(hostUri).split(':')[0];
  return null;
}

export function resolveApiBaseUrl() {
  // 1) Override manual por env (el más confiable)
  const manual = process.env.EXPO_PUBLIC_API_BASE;
  if (manual) {
    const url = manual.endsWith('/') ? manual : manual + '/';
    console.log('[API] Using EXPO_PUBLIC_API_BASE →', url);
    return url;
  }

  // 2) Host detectado del bundle/Metro
  const host = detectHostFromBundle();
  if (host) {
    const base = `http://${host}:3001/api/`;
    console.log('[API] Metro host:', host, '→', base);
    return base;
  }

  // 3) Fallback emulador Android
  if (Platform.OS === 'android') {
    const base = 'http://10.0.2.2:3001/api/';
    console.log('[API] Fallback Android emulator →', base);
    return base;
  }

  // 4) iOS Simulator / Web
  return 'http://localhost:3001/api/';
}

export const api = resolveApiBaseUrl();

// Helper: compone rutas sobre la base
export const buildUrl = (path = '') =>
  api + (path.startsWith('/') ? path.slice(1) : path);
