import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from 'src/lib/api';
import type { User } from 'src/types/schema';

import { AuthContext } from 'src/contexts/auth';

// Module-level state to persist across React StrictMode remounts
// These survive component unmount/remount cycles
let cachedUser: User | null = null;
let isInitialized = false;
let initPromise: Promise<User | null> | null = null;

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state from cached value to maintain data across remounts
  const [user, setUser] = useState<User | null>(() => cachedUser);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<User | null>(cachedUser);

  // Sync userRef and cachedUser with user state
  useEffect(() => {
    userRef.current = user;
    cachedUser = user;
  }, [user]);

  const initAuth = useCallback(async () => {
    // If initialization is in progress, return the same promise
    // This MUST be the first check to prevent race conditions
    if (initPromise) {
      return initPromise;
    }

    // Use cached value to get fresh user value
    const currentUser = cachedUser;

    // If already initialized and has user, return cached user
    if (isInitialized && currentUser) {
      return currentUser;
    }

    // If already initialized but user is null (logged out), don't re-fetch
    if (isInitialized && currentUser === null) {
      return null;
    }

    // Start new initialization
    setIsLoading(true);

    initPromise = (async () => {
      try {
        const userData = await api.auth.getCurrentUser();

        // Update module-level cache IMMEDIATELY before state update
        // This ensures cache is in sync even if setState is delayed
        cachedUser = userData;
        isInitialized = true;

        setUser(userData);
        return userData;
      } catch (error) {
        console.error('[AuthProvider] Error initializing auth:', error);

        // Update module-level cache IMMEDIATELY before state update
        cachedUser = null;
        isInitialized = true;

        setUser(null);
        return null;
      } finally {
        setIsLoading(false);
        initPromise = null;
      }
    })();

    return initPromise;
  }, []);

  // Initialize auth once on mount
  useEffect(() => {
    if (!isInitialized) {
      initAuth();
    }
  }, [initAuth]);

  // Subscribe to auth changes (separate effect, no dependencies)
  useEffect(() => {
    const unsubscribe = api.auth.subscribeToAuthChanges((event, userData) => {
      if (event === 'SIGNED_OUT') {
        // Update module-level cache first
        cachedUser = null;
        isInitialized = false;

        setUser(null);
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Update module-level cache first
        cachedUser = userData;
        isInitialized = true;

        setUser(userData);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      await api.auth.login({ email, password });
      // User will be set via SIGNED_IN event callback
      // Don't set isLoading to false here - let the callback handle it
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await api.auth.logout();
      setUser(null);
      isInitialized = false;
    } catch (error) {
      console.error('Logout error:', error);
      // Even on error, clear user state
      setUser(null);
      isInitialized = false;
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
