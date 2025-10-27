import { tablesDB, Query, DATABASE_ID, TABLES } from './client'
import { BaseAPI } from './base'
import type { Stats, User, Ideation } from 'src/types/schema'

/**
 * Stats API
 * Handles statistics calculations for admin dashboard
 */
export class StatsAPI extends BaseAPI {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<Stats> {
    try {
      // Fetch all participants
      const allParticipantsResponse = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        queries: [Query.equal('role', ['participant']), Query.limit(9999)],
      })

      const allParticipants = this.transformDocuments<User>(allParticipantsResponse.rows)

      // Calculate participant counts
      const offlineCount = allParticipants.filter((u) => u.participantType === 'offline').length
      const onlineCount = allParticipants.filter((u) => u.participantType === 'online').length

      // Calculate checked-in counts
      const checkedIn = allParticipants.filter((u) => u.isCheckedIn)
      const checkedInOffline = checkedIn.filter((u) => u.participantType === 'offline').length
      const checkedInOnline = checkedIn.filter((u) => u.participantType === 'online').length

      // Calculate eligible for draw
      const eligible = allParticipants.filter((u) => u.isEligibleToDraw).length

      // Fetch submissions
      const submissionsResponse = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.IDEATIONS,
        queries: [Query.equal('isSubmitted', [true]), Query.limit(9999)],
      })

      const submissions = this.transformDocuments<Ideation>(submissionsResponse.rows)
      const groupSubmissions = submissions.filter((s) => s.isGroup).length
      const individualSubmissions = submissions.filter((s) => !s.isGroup).length

      return {
        totalParticipants: {
          total: allParticipants.length,
          offline: offlineCount,
          online: onlineCount,
        },
        checkedIn: {
          total: checkedIn.length,
          offline: checkedInOffline,
          online: checkedInOnline,
        },
        eligibleForDraw: eligible,
        submissions: {
          total: submissions.length,
          group: groupSubmissions,
          individual: individualSubmissions,
        },
      }
    } catch (error) {
      this.handleError(error, 'getStats')
    }
  }

  /**
   * Get total participants count
   */
  async getTotalParticipants(): Promise<number> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        queries: [Query.equal('role', ['participant']), Query.limit(1)],
      })

      return response.total
    } catch (error) {
      this.handleError(error, 'getTotalParticipants')
    }
  }

  /**
   * Get checked-in participants count
   */
  async getCheckedInCount(): Promise<number> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        queries: [
          Query.equal('role', ['participant']),
          Query.equal('isCheckedIn', [true]),
          Query.limit(1),
        ],
      })

      return response.total
    } catch (error) {
      this.handleError(error, 'getCheckedInCount')
    }
  }

  /**
   * Get eligible for draw count
   */
  async getEligibleCount(): Promise<number> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        queries: [
          Query.equal('role', ['participant']),
          Query.equal('isEligibleToDraw', [true]),
          Query.limit(1),
        ],
      })

      return response.total
    } catch (error) {
      this.handleError(error, 'getEligibleCount')
    }
  }

  /**
   * Get submissions count
   */
  async getSubmissionsCount(): Promise<number> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.IDEATIONS,
        queries: [Query.equal('isSubmitted', [true]), Query.limit(1)],
      })

      return response.total
    } catch (error) {
      this.handleError(error, 'getSubmissionsCount')
    }
  }
}
