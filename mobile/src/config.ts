import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Configuration
// In dev: derive host from Expo's dev server (hostUri) when on a physical device, so the app
// uses the same machine that serves the bundle. Otherwise: Android emulator 10.0.2.2, iOS localhost.
// Override with EXPO_PUBLIC_API_HOST if needed.
function getDevHost(): string {
  const envHost = typeof process !== 'undefined' ? process?.env?.EXPO_PUBLIC_API_HOST : undefined;
  if (envHost) return String(envHost);

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = String(hostUri).split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') return host;
  }

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

// Production: use EXPO_PUBLIC_API_URL (e.g. https://your-api.onrender.com/api) or fallback
const prodUrl =
  typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_URL
    ? String(process.env.EXPO_PUBLIC_API_URL).replace(/\/$/, '')
    : 'https://api.afrikad.com/api';

export const API_BASE_URL = __DEV__
  ? `http://${getDevHost()}:5001/api`
  : prodUrl + (prodUrl.endsWith('/api') ? '' : '/api');

// App Configuration
export const APP_CONFIG = {
  name: 'AfriKAD',
  version: '1.0.0',
  description: 'Pay globally from Africa in one tap',
};
