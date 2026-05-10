import { apiClient } from '../lib/apiClient';
import type { User } from '../types/domain';

/* ── Backend shape (snake_case) → Frontend shape (camelCase) ── */
interface BackendUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  is_email_verified: boolean;
}

export function mapUser(u: BackendUser): User {
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isEmailVerified: u.is_email_verified,
  };
}

/* ── Request payload shapes ── */
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: true;
  isMarketingOptIn?: boolean;
}

/* ── Response shapes ── */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginData {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
}

interface RegisterData {
  user: BackendUser;
}

/* ── API calls ── */
export const authApi = {
  async login(payload: LoginPayload): Promise<{ user: User } & AuthTokens> {
    const res = await apiClient.post<LoginData>('/auth/login', payload, { skipAuth: true });
    return {
      user: mapUser(res.data.user),
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    };
  },

  async register(payload: RegisterPayload): Promise<{ user: User }> {
    const res = await apiClient.post<RegisterData>('/auth/register', payload, { skipAuth: true });
    return { user: mapUser(res.data.user) };
  },

  logout(refreshToken: string) {
    return apiClient.post<{ message: string }>('/auth/logout', { refreshToken });
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>('/auth/refresh', { refreshToken }, { skipAuth: true });
    return res.data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const res = await apiClient.get<{ message: string }>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
      { skipAuth: true },
    );
    return res.data;
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>(
      '/auth/resend-verification',
      { email },
      { skipAuth: true },
    );
    return res.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>(
      '/auth/forgot-password',
      { email },
      { skipAuth: true },
    );
    return res.data;
  },

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>(
      '/auth/reset-password',
      { token, password, confirmPassword },
      { skipAuth: true },
    );
    return res.data;
  },

  async verifyAdminAccess(): Promise<{ message: string }> {
    const res = await apiClient.get<{ message: string }>('/users/admin/access');
    return res.data;
  },
};
