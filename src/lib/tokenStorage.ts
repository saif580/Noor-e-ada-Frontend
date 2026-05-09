const ACCESS_TOKEN_KEY = 'noor_access_token';
const REFRESH_TOKEN_KEY = 'noor_refresh_token';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const tokenStorage = {
  getAccessToken() {
    return canUseStorage() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  },

  getRefreshToken() {
    return canUseStorage() ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  },

  setTokens(accessToken: string, refreshToken: string) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
