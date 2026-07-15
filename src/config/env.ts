const DEFAULT_API_BASE_URL = '/api';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME ?? 'Noor-e-ada',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
} as const;
