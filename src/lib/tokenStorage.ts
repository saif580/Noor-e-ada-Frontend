import type { User } from '../types/domain';

const ACCESS_TOKEN_KEY  = 'noor_access_token';
const REFRESH_TOKEN_KEY = 'noor_refresh_token';
const USER_KEY          = 'noor_user';

const canUseStorage = () => typeof globalThis !== 'undefined' && Boolean(globalThis.localStorage);

export const tokenStorage = {
  getAccessToken(): string | null {
    return canUseStorage() ? globalThis.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  },

  getRefreshToken(): string | null {
    return canUseStorage() ? globalThis.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    if (!canUseStorage()) return;
    globalThis.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    globalThis.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  getUser(): User | null {
    if (!canUseStorage()) return null;
    const raw = globalThis.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  setUser(user: User): void {
    if (!canUseStorage()) return;
    globalThis.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /** Clears tokens and stored user — call on logout or session expiry */
  clear(): void {
    if (!canUseStorage()) return;
    globalThis.localStorage.removeItem(ACCESS_TOKEN_KEY);
    globalThis.localStorage.removeItem(REFRESH_TOKEN_KEY);
    globalThis.localStorage.removeItem(USER_KEY);
  },
};
