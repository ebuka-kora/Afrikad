// API Configuration
/** Local Node servers usually use HTTP on :5001; https://localhost causes ERR_SSL_PROTOCOL_ERROR. */
function normalizeApiUrl(url: string): string {
  const trimmed = url.replace(/\/$/, '');
  if (/^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(trimmed)) {
    return trimmed.replace(/^https:/i, 'http:');
  }
  return trimmed;
}

const envApiUrl =
  typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_URL
    ? normalizeApiUrl(String(process.env.EXPO_PUBLIC_API_URL))
    : '';

// Use .env when available; fallback to Render so production never breaks.
const baseApiUrl = envApiUrl || 'https://afirkad-backend.onrender.com';
export const API_BASE_URL = baseApiUrl.endsWith('/api') ? baseApiUrl : `${baseApiUrl}/api`;

// App Configuration
export const APP_CONFIG = {
  name: 'AfriKAD',
  version: '1.0.0',
  description: 'Pay globally from Africa in one tap',
};