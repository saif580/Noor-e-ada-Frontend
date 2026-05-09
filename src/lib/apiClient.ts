import { env } from '../config/env';
import { tokenStorage } from './tokenStorage';
import type { ApiEnvelope } from '../types/domain';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  body?: unknown;
  method?: HttpMethod;
  skipAuth?: boolean;
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

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, method = 'GET', skipAuth = false, ...rest } = options;
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
