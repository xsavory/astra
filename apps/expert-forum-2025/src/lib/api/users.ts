import { supabase } from './client'
import { BaseAPI } from './base'
import type { Database } from 'src/types/database'
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  PaginatedResponse,
} from 'src/types/schema'

type DBUser = Database['public']['Tables']['users']['Row']

/**
 * Users API with Supabase
 * Handles user management (CRUD operations)
 */
export class UsersAPI extends BaseAPI {
  /**
   * Get paginated users with filters
   */
  async getUsers(options?: {
    page?: number
    limit?: number
    filters?: UserFilters
  }): Promise<PaginatedResponse<User>> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 10
      const filters = options?.filters || {}
      const offset = (page - 1) * limit

      // Build query
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'participant')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (filters.participant_type) {
        query = query.eq('participant_type', filters.participant_type)
      }

      if (filters.is_checked_in !== undefined) {
        query = query.eq('is_checked_in', filters.is_checked_in)
      }

      if (filters.is_eligible_to_draw !== undefined) {
        query = query.eq('is_eligible_to_draw', filters.is_eligible_to_draw)
      }

      if (filters.company) {
        query = query.eq('company', filters.company)
      }

      if (filters.search) {
        // Search by name or email using text search
        query = query.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        )
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const total = count || 0
      const users = data as User[]

      return {
        items: users,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      }
    } catch (error) {
      this.handleError(error, 'getUsers')
    }
  }

  /**
   * Get all users for export (no pagination)
   */
  async getAllUsersForExport(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'participant')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data as User[]
    } catch (error) {
      this.handleError(error, 'getAllUsersForExport')
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      return this.ensureData(data, 'User not found') as User
    } catch (error) {
      this.handleError(error, 'getUser')
    }
  }

  /**
   * Get user with all related details (booth checkins, ideation, group)
   */
  async getUserWithDetails() {
    // TODO: implement this method
  }

  /**
   * Create new user (auth + database)
   */
  async createUser(data: CreateUserInput): Promise<User> {
    try {
      // Validate required fields
      this.validateRequired(data, ['name', 'email', 'participant_type'])

      // Get participant password from env
      const password =
        (import.meta.env.VITE_PARTICIPANT_DEFAULT_PASSWORD as string) ||
        'expertforum2025'

      // Create auth account
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: data.email,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: data.name,
          },
        })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create auth user')
      }

      // Create database record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          auth_id: authData.user.id,
          name: data.name,
          email: data.email,
          role: 'participant',
          participant_type: data.participant_type,
          company: data.company || null,
          division: data.division || null,
          is_checked_in: false,
          is_eligible_to_draw: false,
        })
        .select()
        .single()

      if (userError) {
        // Rollback: delete auth user if database insert fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw userError
      }

      return userData as User
    } catch (error) {
      this.handleError(error, 'createUser')
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserInput): Promise<User> {
    try {
      const updates: Partial<User> = {}

      if (data.name !== undefined) updates.name = data.name;
      if (data.email !== undefined) updates.email = data.email;
      if (data.participant_type !== undefined) updates.participant_type = data.participant_type;
      if (data.company !== undefined) updates.company = data.company;
      if (data.division !== undefined) updates.division = data.division;

      const { data: userData, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return userData as User
    } catch (error) {
      this.handleError(error, 'updateUser')
    }
  }

  /**
   * Delete user (with validation)
   */
  async deleteUser(userId: string): Promise<{ success: boolean }> {
    try {
      // Fetch user to check if checked in
      const user = await this.getUser(userId)

      if (user.is_checked_in) {
        throw new Error('Participant sudah check-in, tidak dapat dihapus')
      }

      // Hard delete from database (RLS will handle permissions)
      const { error } = await supabase.from('users').delete().eq('id', userId)

      if (error) {
        throw error
      }

      // Also delete from auth (if auth_id exists)
      if (user.id) {
        const { data: authUser } = await supabase
          .from('users')
          .select('auth_id')
          .eq('id', userId)
          .single()

        if (authUser && (authUser as User).auth_id) {
          await supabase.auth.admin.deleteUser((authUser as User).auth_id!)
        }
      }

      return { success: true }
    } catch (error) {
      this.handleError(error, 'deleteUser')
    }
  }

  /**
     * Subscribe to user changes (Realtime Feature #3)
     *
     * This enables real-time user state tracking:
     * - Watches for changes to user fields (is_checked_in, is_eligible_to_draw, etc)
     * - Triggers when any user field is updated
     * - Can be used to auto-refresh UI when staff checks in participant via QR
     * - Can be used to show congratulations UI when eligible
     *
     * @param participantId - The participant to track
     * @param callback - Called when user data changes with full updated user object
     * @returns Unsubscribe function
     */
    subscribeToUserChanges(
      participantId: string,
      callback: (user: User) => void
    ): () => void {
      console.log(`[Realtime] Opening WebSocket connection for user: ${participantId}`)
  
      const channel = supabase
        .channel(`user:${participantId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${participantId}`,
          },
          (payload) => {
            console.log(`[Realtime] Received UPDATE event for user: ${participantId}`, payload.new)
            const updatedUser = payload.new as DBUser
            callback(updatedUser as User)
          }
        )
        .subscribe((status) => {
          console.log(`[Realtime] Subscription status for user ${participantId}:`, status)
        })
  
      return () => {
        console.log(`[Realtime] Closing WebSocket connection for user: ${participantId}`)
        supabase.removeChannel(channel)
      }
    }
}
