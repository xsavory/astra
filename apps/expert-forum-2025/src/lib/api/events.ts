import { supabase } from './client'
import { BaseAPI } from './base'
import type { Event } from 'src/types/schema'

/**
 * Events API with Supabase
 * Handles event data operations
 */
export class EventsAPI extends BaseAPI {
  /**
   * Get current event
   */
  async getEvent(): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .limit(1)
        .single()

      if (error) {
        throw error
      }

      return this.ensureData(data, 'Event tidak ditemukan') as Event
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
      return event.is_active
    } catch {
      return false
    }
  }

  /**
   * Get Zoom meeting URL
   */
  async getZoomMeetingUrl(): Promise<string | null> {
    try {
      const event = await this.getEvent()
      return event.zoom_meeting_url || null
    } catch {
      return null
    }
  }

  /**
   * Check if voting is open
   * Returns true if participants can currently vote
   */
  async isVotesOpen(): Promise<boolean> {
    try {
      const event = await this.getEvent()
      return event.is_votes_open
    } catch {
      return false
    }
  }

  /**
   * Check if voting is locked
   * Returns true if voting has been finalized and locked
   */
  async isVotesLocked(): Promise<boolean> {
    try {
      const event = await this.getEvent()
      return event.is_votes_lock
    } catch {
      return false
    }
  }

  /**
   * Get voting state (open and lock status)
   * Returns both voting flags in a single call for efficiency
   */
  async getVotingState(): Promise<{ isOpen: boolean; isLocked: boolean }> {
    try {
      const event = await this.getEvent()
      return {
        isOpen: event.is_votes_open,
        isLocked: event.is_votes_lock,
      }
    } catch {
      return {
        isOpen: false,
        isLocked: false,
      }
    }
  }
}
