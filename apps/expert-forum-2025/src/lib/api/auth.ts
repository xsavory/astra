import { supabase } from './client'
import { BaseAPI } from './base'
import type { User, LoginInput } from 'src/types/schema'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Authentication API with Supabase Auth
 * Handles user login, logout, session management, and realtime auth state
 */
export class AuthAPI extends BaseAPI {
  private authChannel: RealtimeChannel | null = null

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
   */
  async logout(): Promise<void> {
    try {
      // Unsubscribe from auth channel if exists
      if (this.authChannel) {
        await supabase.removeChannel(this.authChannel)
        this.authChannel = null
      }

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }
    } catch (error) {
      this.handleError(error, 'logout')
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
        return null
      }

      return userData as User
    } catch {
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
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch user data when signed in
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()

          callback('SIGNED_IN', userData as User | null)
        } else if (event === 'SIGNED_OUT') {
          callback('SIGNED_OUT', null)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Refresh user data when token is refreshed
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()

          callback('TOKEN_REFRESHED', userData as User | null)
        }
      }
    )

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe()
    }
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
