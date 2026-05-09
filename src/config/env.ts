const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME ?? 'Noor-e-ada',
} as const;
