import { tablesDB, ID, Query, DATABASE_ID, TABLES } from './client'
import { BaseAPI } from './base'
import type { User, BoothCheckin, CheckinMethod, CreateBoothCheckinInput } from 'src/types/schema'
import { BOOTH_THRESHOLD } from 'src/lib/constants'

/**
 * Checkins API
 * Handles event and booth check-in operations
 */
export class CheckinsAPI extends BaseAPI {
  /**
   * Check-in participant to event
   */
  async checkinEvent(
    participantId: string,
    method: CheckinMethod,
    staffId?: string
  ): Promise<User> {
    try {
      // Get user data
      const userDoc = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        rowId: participantId,
      })
      const user = this.transformDocument<User>(userDoc)

      // For online participants, check if event is active
      if (user.participantType === 'online') {
        const eventResponse = await tablesDB.listRows({
          databaseId: DATABASE_ID,
          tableId: TABLES.EVENTS,
          queries: [Query.limit(1)],
        })

        if (
          eventResponse.rows.length === 0 ||
          !eventResponse.rows[0]?.isActive
        ) {
          throw new Error('Event belum aktif')
        }
      }

      // Check if already checked in
      if (user.isCheckedIn) {
        throw new Error('Participant sudah check-in')
      }

      // Update user check-in status
      const updatedUserDoc = await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        rowId: participantId,
        data: {
          isCheckedIn: true,
          eventCheckinTime: new Date().toISOString(),
          eventCheckinMethod: method,
          checkedInBy: staffId || null,
        },
      })

      return this.transformDocument<User>(updatedUserDoc)
    } catch (error) {
      this.handleError(error, 'checkinEvent')
    }
  }

  /**
   * Check-in participant to booth
   */
  async checkinBooth(
    participantId: string,
    data: CreateBoothCheckinInput
  ): Promise<{ checkin: BoothCheckin; user: User }> {
    try {
      // Get user data
      const userDoc = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        rowId: participantId,
      })
      const user = this.transformDocument<User>(userDoc)

      // Validate: must be checked in to event first
      if (!user.isCheckedIn) {
        throw new Error('Participant belum check-in ke event')
      }

      // Check if already visited this booth
      const existingCheckins = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOTH_CHECKINS,
        queries: [
          Query.equal('participantId', [participantId]),
          Query.equal('boothId', [data.boothId]),
        ],
      })

      if (existingCheckins.rows.length > 0) {
        throw new Error('Booth sudah dikunjungi')
      }

      // Create booth checkin record
      const checkinDoc = await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOTH_CHECKINS,
        rowId: ID.unique(),
        data: {
          participantId,
          boothId: data.boothId,
          answer: data.answer,
          checkinTime: new Date().toISOString(),
        },
      })

      const checkin = this.transformDocument<BoothCheckin>(checkinDoc)

      // Recalculate eligibility
      const allBoothCheckins = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOTH_CHECKINS,
        queries: [Query.equal('participantId', [participantId])],
      })

      const threshold =
        user.participantType === 'offline' ? BOOTH_THRESHOLD.offline : BOOTH_THRESHOLD.online
      const isEligible = allBoothCheckins.total >= threshold

      // Update user eligibility
      const updatedUserDoc = await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        rowId: participantId,
        data: { isEligibleToDraw: isEligible },
      })

      return {
        checkin,
        user: this.transformDocument<User>(updatedUserDoc),
      }
    } catch (error) {
      this.handleError(error, 'checkinBooth')
    }
  }

  /**
   * Get booth checkins for a participant
   */
  async getParticipantBoothCheckins(participantId: string): Promise<BoothCheckin[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOTH_CHECKINS,
        queries: [
          Query.equal('participantId', [participantId]),
          Query.orderDesc('checkinTime'),
        ],
      })

      return this.transformDocuments<BoothCheckin>(response.rows)
    } catch (error) {
      this.handleError(error, 'getParticipantBoothCheckins')
    }
  }

  /**
   * Get booth checkin count for a participant
   */
  async getBoothCheckinCount(participantId: string): Promise<number> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOTH_CHECKINS,
        queries: [Query.equal('participantId', [participantId]), Query.limit(1)],
      })

      return response.total
    } catch (error) {
      this.handleError(error, 'getBoothCheckinCount')
    }
  }

  /**
   * Check if participant has visited a specific booth
   */
  async hasVisitedBooth(participantId: string, boothId: string): Promise<boolean> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOTH_CHECKINS,
        queries: [
          Query.equal('participantId', [participantId]),
          Query.equal('boothId', [boothId]),
          Query.limit(1),
        ],
      })

      return response.rows.length > 0
    } catch (error) {
      this.handleError(error, 'hasVisitedBooth')
    }
  }
}
