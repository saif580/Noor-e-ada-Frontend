import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { authApi, type LoginPayload, type RegisterPayload } from '../api/auth';
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

  const login = useCallback(async (email: string, password: string) => {
    const payload: LoginPayload = { email, password };
    const { user: loggedInUser, accessToken, refreshToken } = await authApi.login(payload);
    tokenStorage.setTokens(accessToken, refreshToken);
    tokenStorage.setUser(loggedInUser);
    setUser(loggedInUser);
  }, []);

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
      register,
      logout,
      updateUser,
    }),
    [user, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
