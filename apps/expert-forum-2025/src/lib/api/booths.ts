import { tablesDB, Query, DATABASE_ID, TABLES } from './client'
import { BaseAPI } from './base'
import type { Booth } from 'src/types/schema'

/**
 * Booths API
 * Handles booth data operations
 */
export class BoothsAPI extends BaseAPI {
  /**
   * Get all booths ordered by order field
   */
  async getBooths(): Promise<Booth[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOTHS,
        queries: [Query.orderAsc('order')],
      })

      return this.transformDocuments<Booth>(response.rows)
    } catch (error) {
      this.handleError(error, 'getBooths')
    }
  }

  /**
   * Get booth by ID
   */
  async getBooth(boothId: string): Promise<Booth> {
    try {
      const boothDoc = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOTHS,
        rowId: boothId,
      })

      return this.transformDocument<Booth>(boothDoc)
    } catch (error) {
      this.handleError(error, 'getBooth')
    }
  }

  /**
   * Get booths for specific participant type
   */
  async getBoothsForParticipantType(participantType: 'online' | 'offline'): Promise<Booth[]> {
    try {
      const allBooths = await this.getBooths()

      // Filter booths based on participant type
      return allBooths.filter((booth) => {
        if (participantType === 'online') {
          // Online participants can only access online-only booths and shared booths
          return !booth.isOfflineOnly
        } else {
          // Offline participants can only access offline-only booths and shared booths
          return !booth.isOnlineOnly
        }
      })
    } catch (error) {
      this.handleError(error, 'getBoothsForParticipantType')
    }
  }
}
