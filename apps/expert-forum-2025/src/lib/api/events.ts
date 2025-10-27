import { tablesDB, Query, DATABASE_ID, TABLES } from './client'
import { BaseAPI } from './base'
import type { Event } from 'src/types/schema'

/**
 * Events API
 * Handles event data operations
 */
export class EventsAPI extends BaseAPI {
  /**
   * Get current event
   */
  async getEvent(): Promise<Event> {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.EVENTS,
        queries: [Query.limit(1)],
      })

      if (response.rows.length === 0) {
        throw new Error('Event tidak ditemukan')
      }

      return this.transformDocument<Event>(response.rows[0]!)
    } catch (error) {
      this.handleError(error, 'getEvent')
    }
  }

  /**
   * Check if event is active
   */
  async isEventActive(): Promise<boolean> {
    try {
      const event = await this.getEvent()
      return event.isActive
    } catch (error) {
      return false
    }
  }

  /**
   * Get Zoom meeting URL
   */
  async getZoomMeetingUrl(): Promise<string | null> {
    try {
      const event = await this.getEvent()
      return event.zoomMeetingUrl || null
    } catch (error) {
      return null
    }
  }
}
