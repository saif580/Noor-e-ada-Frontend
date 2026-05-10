import { createContext } from 'react';
import type { RegisterPayload } from '../api/auth';
import type { User } from '../types/domain';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  register(payload: RegisterPayload): Promise<{ needsVerification: boolean }>;
  logout(): Promise<void>;
  updateUser(user: User): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
