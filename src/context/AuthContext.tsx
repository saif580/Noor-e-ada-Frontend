import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { authApi, type LoginPayload, type RegisterPayload } from '../api/auth';
import { guestCart } from '../lib/guestCart';
import { tokenStorage } from '../lib/tokenStorage';
import type { User } from '../types/domain';
import { AuthContext, type AuthContextValue } from './authContextCore';

const getInitialUser = (): User | null => {
  const storedUser = tokenStorage.getUser();
  const accessToken = tokenStorage.getAccessToken();
  return storedUser && accessToken ? storedUser : null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getInitialUser());

  const completeLogin = useCallback(async (loggedInUser: User, accessToken: string, refreshToken: string) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    tokenStorage.setUser(loggedInUser);
    try {
      await guestCart.mergeIntoAccount();
    } catch {
      // Do not block login if a saved guest-cart item is no longer available.
    }
    setUser(loggedInUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const payload: LoginPayload = { email, password };
    const { user: loggedInUser, accessToken, refreshToken } = await authApi.login(payload);
    await completeLogin(loggedInUser, accessToken, refreshToken);
  }, [completeLogin]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const { user: loggedInUser, accessToken, refreshToken } = await authApi.loginWithGoogle({ idToken });
    await completeLogin(loggedInUser, accessToken, refreshToken);
  }, [completeLogin]);

  const loginWithFacebook = useCallback(async (accessToken: string) => {
    const { user: loggedInUser, accessToken: appAccessToken, refreshToken } = await authApi.loginWithFacebook({ accessToken });
    await completeLogin(loggedInUser, appAccessToken, refreshToken);
  }, [completeLogin]);

  const register = useCallback(async (payload: RegisterPayload) => {
    await authApi.register(payload);
    // Backend sends a verification email; user is not logged in yet
    return { needsVerification: true };
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // Always clear locally even if the server call fails
    }
    tokenStorage.clear();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    tokenStorage.setUser(updatedUser);
    setUser(updatedUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      login,
      loginWithGoogle,
      loginWithFacebook,
      register,
      logout,
      updateUser,
    }),
    [user, login, loginWithGoogle, loginWithFacebook, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
