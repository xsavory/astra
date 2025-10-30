import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from 'src/lib/api';
import type { User } from 'src/types/schema';

import { AuthContext } from 'src/contexts/auth';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);
  const initPromise = useRef<Promise<User | null> | null>(null);
  const userRef = useRef<User | null>(null);

  // Sync userRef with user state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const initAuth = useCallback(async () => {
    // Use ref to get fresh user value, not closure
    const currentUser = userRef.current;

    // If already initialized and has user, return cached user
    if (isInitialized.current && currentUser) {
      return currentUser;
    }

    // If already initialized but user is null (logged out), don't re-fetch
    if (isInitialized.current && currentUser === null) {
      return null;
    }

    // If initialization is in progress, return the same promise
    if (initPromise.current) {
      return initPromise.current;
    }

    // Start new initialization
    setIsLoading(true);

    initPromise.current = (async () => {
      try {
        const userData = await api.auth.getCurrentUser();
        setUser(userData);
        isInitialized.current = true;
        return userData;
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        isInitialized.current = true;
        return null;
      } finally {
        setIsLoading(false);
        initPromise.current = null;
      }
    })();

    return initPromise.current;
  }, []);

  // Initialize auth once on mount
  useEffect(() => {
    if (!isInitialized.current) {
      initAuth();
    }
  }, [initAuth]);

  // Subscribe to auth changes (separate effect, no dependencies)
  useEffect(() => {
    const unsubscribe = api.auth.subscribeToAuthChanges((event, userData) => {
      if (event === 'SIGNED_OUT') {
        console.log('Auth event: SIGNED_OUT, clearing user');
        setUser(null);
        setIsLoading(false);
        isInitialized.current = false;
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log(`Auth event: ${event}, updating user`);
        setUser(userData);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const result = await api.auth.login({ email, password });
      setUser(result.user);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await api.auth.logout();
      setUser(null);
      isInitialized.current = false;
    } catch (error) {
      console.error('Logout error:', error);
      // Even on error, clear user state
      setUser(null);
      isInitialized.current = false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshUser,
      initAuth
    }),
    [user, isLoading, login, logout, refreshUser, initAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
