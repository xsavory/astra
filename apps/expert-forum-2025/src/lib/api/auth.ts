import { account, tablesDB, DATABASE_ID, TABLES } from './client'
import { BaseAPI } from './base'
import type { User, LoginInput } from 'src/types/schema'

/**
 * Authentication API
 * Handles user login, logout, and session management
 */
export class AuthAPI extends BaseAPI {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginInput): Promise<{ user: User; sessionId: string }> {
    try {
      const { email, password } = credentials

      // Create session
      const session = await account.createEmailPasswordSession({ email, password: password! })

      // Get user data from database
      const accountUser = await account.get()
      const userDoc = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        rowId: accountUser.$id,
      })

      return {
        user: this.transformDocument<User>(userDoc),
        sessionId: session.$id,
      }
    } catch (error) {
      this.handleError(error, 'login')
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession({ sessionId: 'current' })
    } catch (error) {
      this.handleError(error, 'logout')
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const accountUser = await account.get()
      const userDoc = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        rowId: accountUser.$id,
      })

      return this.transformDocument<User>(userDoc)
    } catch {
      // Return null if no session exists
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await account.get()
      return true
    } catch {
      return false
    }
  }
}
