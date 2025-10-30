import { createContext } from 'react';
import type { User } from 'src/types/schema';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initAuth: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);