import { env } from '../config/env';
import { tokenStorage } from './tokenStorage';
import type { ApiEnvelope } from '../types/domain';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  body?: unknown;
  method?: HttpMethod;
  skipAuth?: boolean;
  /** @internal prevents refresh-retry loops */
  _retried?: boolean;
}

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${env.apiBaseUrl}${normalizedPath}`;
};

// Coordinates concurrent 401s so only one refresh call goes out
let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      tokenStorage.clear();
      return false;
    }

    const data = await res.json();
    const { accessToken, refreshToken: newRefresh } = (data?.data ?? {}) as {
      accessToken?: string;
      refreshToken?: string;
    };

    if (accessToken && newRefresh) {
      tokenStorage.setTokens(accessToken, newRefresh);
      return true;
    }

    tokenStorage.clear();
    return false;
  } catch {
    tokenStorage.clear();
    return false;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, method = 'GET', skipAuth = false, _retried = false, ...rest } = options;
  const token = tokenStorage.getAccessToken();
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (!skipAuth && token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // 401 → attempt token refresh once, then retry
  if (response.status === 401 && !skipAuth && !_retried) {
    if (!refreshInFlight) {
      refreshInFlight = tryRefreshToken().finally(() => {
        refreshInFlight = null;
      });
    }
    const refreshed = await refreshInFlight;
    if (refreshed) {
      return request<T>(path, { ...options, _retried: true });
    }
    throw new ApiError('Session expired. Please log in again.', 401, null);
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string' ? payload.message : 'Request failed';
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<ApiEnvelope<T>>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<ApiEnvelope<T>>(path, { ...options, method: 'POST', body });
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<ApiEnvelope<T>>(path, { ...options, method: 'PUT', body });
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<ApiEnvelope<T>>(path, { ...options, method: 'PATCH', body });
  },

  delete<T>(path: string, options?: RequestOptions) {
    return request<ApiEnvelope<T>>(path, { ...options, method: 'DELETE' });
  },
};
