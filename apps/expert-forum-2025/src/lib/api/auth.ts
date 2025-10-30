import { supabase } from './client'
import { BaseAPI } from './base'
import type { User, LoginInput } from 'src/types/schema'

/**
 * Authentication API with Supabase Auth
 * Handles user login, logout, session management, and realtime auth state
 */
export class AuthAPI extends BaseAPI {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginInput): Promise<{ user: User }> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password!,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Authentication failed')
      }

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single()

      if (userError) {
        throw userError
      }

      if (!userData) {
        throw new Error('User data not found')
      }

      return { user: userData as User }
    } catch (error) {
      this.handleError(error, 'login')
    }
  }

  /**
   * Logout current user
   * With timeout protection to prevent hanging on inactive tabs
   */
  async logout(): Promise<void> {
    try {
      // Add timeout protection - max 5 seconds
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Logout timeout')), 5000)
        )
      ])
    } catch (error) {
      // Log error but don't throw - we still want to clear local state
      console.warn('Logout timeout or error (proceeding with local cleanup):', error)
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Error getting session:', sessionError)
        throw sessionError
      }

      if (!session) {
        return null
      }

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single()

      if (userError || !userData) {
        console.error('Error fetching user data:', userError)
        return null
      }

      return userData as User
    } catch(error) {
      console.error('Error getting current user:', error)
      // Return null if no session exists or any error occurs
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session !== null
    } catch {
      return false
    }
  }

  /**
   * Subscribe to auth state changes (Realtime Feature #1)
   *
   * This enables real-time authentication state updates:
   * - Automatically detect when user logs in/out
   * - Handle session refresh
   * - Sync auth state across tabs
   */
  subscribeToAuthChanges(
    callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', user: User | null) => void
  ): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Use setTimeout to defer async work and prevent blocking auth state changes
        // See: https://github.com/supabase/auth-js/issues/762#issuecomment-1780006492
        setTimeout(async () => {
          if (event === 'SIGNED_IN' && session) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('auth_id', session.user.id)
              .single()

            callback('SIGNED_IN', userData as User | null)
          } else if (event === 'SIGNED_OUT') {
            callback('SIGNED_OUT', null)
          } else if (event === 'TOKEN_REFRESHED' && session) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('auth_id', session.user.id)
              .single()

            callback('TOKEN_REFRESHED', userData as User | null)
          }
        }, 0)
      }
    )

    return () => subscription.unsubscribe()
  }

  /**
   * Get current auth session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      this.handleError(error, 'getSession')
    }

    return session
  }
}
