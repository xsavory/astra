import { account, tablesDB, ID, Query, DATABASE_ID, TABLES } from './client'
import { BaseAPI } from './base'
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  PaginatedResponse,
  UserDetail,
  BoothCheckinWithDetails,
  Ideation,
  GroupWithDetails,
} from 'src/types/schema'

/**
 * Users API
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

      const queries = [
        Query.equal('role', ['participant']),
        Query.limit(limit),
        Query.offset((page - 1) * limit),
        Query.orderDesc('createdAt'),
      ]

      // Apply filters
      if (filters.participantType) {
        queries.push(Query.equal('participantType', [filters.participantType]))
      }

      if (filters.isCheckedIn !== undefined) {
        queries.push(Query.equal('isCheckedIn', [filters.isCheckedIn]))
      }

      if (filters.isEligibleToDraw !== undefined) {
        queries.push(Query.equal('isEligibleToDraw', [filters.isEligibleToDraw]))
      }

      if (filters.company) {
        queries.push(Query.equal('company', [filters.company]))
      }

      if (filters.search) {
        queries.push(Query.search('name', filters.search))
      }

      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        queries,
      })

      return {
        items: this.transformDocuments<User>(response.rows),
        total: response.total,
        page,
        limit,
        totalPages: Math.ceil(response.total / limit),
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
      const queries = [Query.equal('role', ['participant']), Query.limit(9999)]

      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        queries,
      })

      return this.transformDocuments<User>(response.rows)
    } catch (error) {
      this.handleError(error, 'getAllUsersForExport')
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    try {
      const userDoc = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        rowId: userId,
      })

      return this.transformDocument<User>(userDoc)
    } catch (error) {
      this.handleError(error, 'getUser')
    }
  }

  /**
   * Get user with all related details (booth checkins, ideation, group)
   */
  async getUserWithDetails(userId: string): Promise<UserDetail> {
    try {
      // Get user
      const user = await this.getUser(userId)

      // Get booth checkins
      const boothCheckinsResponse = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOTH_CHECKINS,
        queries: [Query.equal('participantId', [userId]), Query.orderDesc('checkinTime')],
      })

      // For each booth checkin, fetch booth details
      const boothCheckins: BoothCheckinWithDetails[] = await Promise.all(
        boothCheckinsResponse.rows.map(async (doc) => {
          const boothDoc = await tablesDB.getRow({
            databaseId: DATABASE_ID,
            tableId: TABLES.BOOTHS,
            rowId: doc.boothId,
          })

          return {
            ...this.transformDocument(doc),
            booth: this.transformDocument(boothDoc),
          }
        })
      )

      // Get ideation (if exists)
      const ideationsResponse = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.IDEATIONS,
        queries: [Query.equal('creatorId', [userId]), Query.limit(1)],
      })

      const ideation: Ideation | null =
        ideationsResponse.rows.length > 0
          ? this.transformDocument<Ideation>(ideationsResponse.rows[0]!)
          : null

      // Get group (if exists)
      let group: GroupWithDetails | null = null
      if (user.groupId) {
        const groupDoc = await tablesDB.getRow({
          databaseId: DATABASE_ID,
          tableId: TABLES.GROUPS,
          rowId: user.groupId,
        })

        // Fetch all participants in the group
        const groupData = this.transformDocument<GroupWithDetails>(groupDoc)
        const participants = await Promise.all(
          groupData.participantIds.map((id) => this.getUser(id))
        )

        group = {
          ...groupData,
          participants,
        }
      }

      return {
        user,
        boothCheckins,
        ideation,
        group,
      }
    } catch (error) {
      this.handleError(error, 'getUserWithDetails')
    }
  }

  /**
   * Create new user (auth + database)
   */
  async createUser(data: CreateUserInput): Promise<User> {
    try {
      // Get participant password from env
      const password = (import.meta.env.VITE_PARTICIPANT_PASSWORD as string) || 'defaultPass123'
      const userId = ID.unique()

      // Create auth account
      await account.create(userId, data.email, password, data.name)

      // Create database record
      const userDoc = await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        rowId: userId,
        data: {
          name: data.name,
          email: data.email,
          role: 'participant',
          participantType: data.participantType,
          company: data.company || null,
          division: data.division || null,
          isCheckedIn: false,
          isEligibleToDraw: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })

      return this.transformDocument<User>(userDoc)
    } catch (error) {
      this.handleError(error, 'createUser')
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserInput): Promise<User> {
    try {
      const updates = {
        ...data,
        updatedAt: new Date().toISOString(),
      }

      const userDoc = await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        rowId: userId,
        data: updates,
      })

      return this.transformDocument<User>(userDoc)
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

      if (user.isCheckedIn) {
        throw new Error('Participant sudah check-in, tidak dapat dihapus')
      }

      // Soft delete: update with deletedAt timestamp
      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        rowId: userId,
        data: {
          deletedAt: new Date().toISOString(),
        },
      })

      return { success: true }
    } catch (error) {
      this.handleError(error, 'deleteUser')
    }
  }

  /**
   * Get available offline participants (not in any group)
   */
  async getAvailableParticipants(): Promise<User[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        queries: [
          Query.equal('participantType', ['offline']),
          Query.isNull('groupId'),
          Query.equal('role', ['participant']),
        ],
      })

      return this.transformDocuments<User>(response.rows)
    } catch (error) {
      this.handleError(error, 'getAvailableParticipants')
    }
  }
}
