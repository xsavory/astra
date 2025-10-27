import { tablesDB, ID, Query, DATABASE_ID, TABLES } from './client'
import { BaseAPI } from './base'
import type { User, DrawLog, DrawLogWithDetails } from 'src/types/schema'

/**
 * Draws API
 * Handles lucky draw operations
 */
export class DrawsAPI extends BaseAPI {
  /**
   * Get eligible participants for draw
   * (eligible and not yet won in previous draws)
   */
  async getEligibleParticipants(): Promise<User[]> {
    try {
      // Get all draw logs to find past winners
      const drawLogsResponse = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.DRAW_LOGS,
      })

      // Flatten all winners from previous draws
      const pastWinners = drawLogsResponse.rows.flatMap(log => log.winners || [])

      // Get all eligible participants
      const eligibleResponse = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.USERS,
        queries: [Query.equal('isEligibleToDraw', [true]), Query.limit(9999)],
      })

      const allEligible = this.transformDocuments<User>(eligibleResponse.rows)

      // Filter out past winners
      const eligible = allEligible.filter(user => !pastWinners.includes(user.$id))

      return eligible
    } catch (error) {
      this.handleError(error, 'getEligibleParticipants')
    }
  }

  /**
   * Submit draw results
   */
  async submitDraw(winners: string[], staffId?: string): Promise<DrawLog> {
    try {
      // Validate winners are eligible
      const eligible = await this.getEligibleParticipants()
      const eligibleIds = eligible.map(u => u.$id)

      const invalidWinners = winners.filter(id => !eligibleIds.includes(id))
      if (invalidWinners.length > 0) {
        throw new Error('Beberapa pemenang tidak eligible atau sudah pernah menang')
      }

      // Create draw log
      const drawLogDoc = await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.DRAW_LOGS,
        rowId: ID.unique(),
        data: {
          winners,
          staffId: staffId || null,
          createdAt: new Date().toISOString(),
        },
      })

      return this.transformDocument<DrawLog>(drawLogDoc)
    } catch (error) {
      this.handleError(error, 'submitDraw')
    }
  }

  /**
   * Get all draw logs
   */
  async getDrawLogs(): Promise<DrawLog[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.DRAW_LOGS,
        queries: [Query.orderDesc('createdAt')],
      })

      return this.transformDocuments<DrawLog>(response.rows)
    } catch (error) {
      this.handleError(error, 'getDrawLogs')
    }
  }

  /**
   * Get draw log by ID with winner details
   */
  async getDrawLogWithDetails(drawLogId: string): Promise<DrawLogWithDetails> {
    try {
      const drawLogDoc = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.DRAW_LOGS,
        rowId: drawLogId,
      })

      const drawLog = this.transformDocument<DrawLog>(drawLogDoc)

      // Fetch winner details
      const winnerDetails = await Promise.all(
        drawLog.winners.map(async (winnerId) => {
          const doc = await tablesDB.getRow({
            databaseId: DATABASE_ID,
            tableId: TABLES.USERS,
            rowId: winnerId,
          })
          return this.transformDocument<User>(doc)
        })
      )

      // Fetch staff details if exists
      let staff: User | undefined
      if (drawLog.staffId) {
        const staffDoc = await tablesDB.getRow({
          databaseId: DATABASE_ID,
          tableId: TABLES.USERS,
          rowId: drawLog.staffId,
        })
        staff = this.transformDocument<User>(staffDoc)
      }

      return {
        ...drawLog,
        winnerDetails,
        staff,
      }
    } catch (error) {
      this.handleError(error, 'getDrawLogWithDetails')
    }
  }

  /**
   * Get latest draw log
   */
  async getLatestDrawLog(): Promise<DrawLog | null> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.DRAW_LOGS,
        queries: [Query.orderDesc('createdAt'), Query.limit(1)],
      })

      if (response.rows.length === 0) {
        return null
      }

      return this.transformDocument<DrawLog>(response.rows[0]!)
    } catch (error) {
      this.handleError(error, 'getLatestDrawLog')
    }
  }
}
