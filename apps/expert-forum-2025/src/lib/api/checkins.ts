import { supabase } from './client'
import { BaseAPI } from './base'
import type { Database } from 'src/types/database'
import type {
  User,
  BoothCheckin,
  CheckinMethod,
  CreateBoothCheckinInput,
} from 'src/types/schema'
import { BOOTH_THRESHOLD } from 'src/lib/constants'
import type { RealtimeChannel } from '@supabase/supabase-js'

type DBUser = Database['public']['Tables']['users']['Row']
type DBBoothCheckin = Database['public']['Tables']['booth_checkins']['Row']

/**
 * Checkins API with Supabase
 * Handles event and booth check-in operations with realtime progress tracking
 */
export class CheckinsAPI extends BaseAPI {
  private progressChannel: RealtimeChannel | null = null

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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', participantId)
        .single()

      if (userError) {
        console.error('[CheckinsAPI] Error fetching user:', userError)
        throw userError
      }

      if (!userData) {
        throw new Error('User not found')
      }

      const user = userData as DBUser

      // For online participants, check if event is active
      if (user.participant_type === 'online') {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('is_active')
          .limit(1)
          .single()

        if (eventError) {
          console.error('[CheckinsAPI] Error fetching event:', eventError)
        }

        if (eventError || !eventData || !eventData.is_active) {
          throw new Error('Event belum aktif')
        }
      }

      // Check if already checked in
      if (user.is_checked_in) {
        throw new Error('Participant sudah check-in')
      }

      // Update user check-in status
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          is_checked_in: true,
          event_checkin_time: new Date().toISOString(),
          event_checkin_method: method,
          checked_in_by: staffId || null,
        })
        .eq('id', participantId)
        .select()
        .single()

      if (updateError) {
        console.error('[CheckinsAPI] Error updating user check-in:', updateError)
        throw updateError
      }

      if (!updatedUser) {
        console.error('[CheckinsAPI] Update returned no data for participantId:', participantId)
        throw new Error('Failed to update user check-in status')
      }

      return updatedUser as User
    } catch (error) {
      this.handleError(error, 'checkinEvent')
    }
  }

  /**
   * Check-in participant to booth
   * Calculates and updates eligibility in API layer
   */
  async checkinBooth(
    participantId: string,
    data: CreateBoothCheckinInput
  ): Promise<{ checkin: BoothCheckin; user: User }> {
    try {
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', participantId)
        .single()

      if (userError) {
        throw userError
      }

      if (!userData) {
        throw new Error('User not found')
      }

      const user = userData as DBUser

      // Validate: must be checked in to event first
      if (!user.is_checked_in) {
        throw new Error('Participant belum check-in ke event')
      }

      // Check if already visited this booth (unique constraint will also catch this)
      const { data: existingCheckin, error: checkError } = await supabase
        .from('booth_checkins')
        .select('id')
        .eq('participant_id', participantId)
        .eq('booth_id', data.booth_id)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      if (existingCheckin) {
        throw new Error('Booth sudah dikunjungi')
      }

      // Create booth checkin record
      const { data: checkinData, error: checkinError } = await supabase
        .from('booth_checkins')
        .insert({
          participant_id: participantId,
          booth_id: data.booth_id,
          answer: data.answer,
        })
        .select()
        .single()

      if (checkinError) {
        throw checkinError
      }

      const checkin = this.ensureData(checkinData, 'Failed to create booth checkin') as BoothCheckin

      // Calculate eligibility in API layer (business logic)
      const boothCount = await this.getBoothCheckinCount(participantId)
      const threshold = user.participant_type === 'offline'
        ? BOOTH_THRESHOLD.offline
        : BOOTH_THRESHOLD.online
      const isEligible = boothCount >= threshold

      // Update user's eligibility status
      const { data: updatedUserData, error: updatedUserError } = await supabase
        .from('users')
        .update({
          is_eligible_to_draw: isEligible
        })
        .eq('id', participantId)
        .select()
        .single()

      if (updatedUserError) {
        throw updatedUserError
      }

      return {
        checkin,
        user: this.ensureData(updatedUserData, 'Failed to update user eligibility') as User,
      }
    } catch (error) {
      this.handleError(error, 'checkinBooth')
    }
  }

  /**
   * Get booth checkins for a participant
   */
  async getParticipantBoothCheckins(
    participantId: string
  ): Promise<BoothCheckin[]> {
    try {
      const { data, error } = await supabase
        .from('booth_checkins')
        .select('*')
        .eq('participant_id', participantId)
        .order('checkin_time', { ascending: false })

      if (error) {
        throw error
      }

      return (data || []).map((checkin) => checkin as BoothCheckin)
    } catch (error) {
      this.handleError(error, 'getParticipantBoothCheckins')
    }
  }

  /**
   * Get booth checkin count for a participant
   */
  async getBoothCheckinCount(participantId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('booth_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('participant_id', participantId)

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      this.handleError(error, 'getBoothCheckinCount')
    }
  }

  /**
   * Check if participant has visited a specific booth
   */
  async hasVisitedBooth(
    participantId: string,
    boothId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('booth_checkins')
        .select('id')
        .eq('participant_id', participantId)
        .eq('booth_id', boothId)
        .maybeSingle()

      if (error) {
        throw error
      }

      return data !== null
    } catch (error) {
      this.handleError(error, 'hasVisitedBooth')
    }
  }

  /**
   * Subscribe to progress updates for a participant (Realtime Feature #2)
   *
   * This enables real-time progress tracking:
   * - Automatically updates booth completion count
   * - Triggers when new booth check-ins are created
   * - Updates eligibility status in real-time
   * - Powers live progress bars on participant dashboard
   *
   * @param participantId - The participant to track
   * @param callback - Called when progress changes with updated booth count and eligibility
   * @returns Unsubscribe function
   */
  subscribeToProgress(
    participantId: string,
    callback: (data: {
      boothCount: number
      isEligible: boolean
      latestCheckin?: BoothCheckin
    }) => void
  ): () => void {
    // Subscribe to booth_checkins for this participant
    this.progressChannel = supabase
      .channel(`progress:${participantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'booth_checkins',
          filter: `participant_id=eq.${participantId}`,
        },
        async (payload) => {
          // New booth checkin inserted
          const newCheckin = payload.new as DBBoothCheckin

          // Get updated booth count
          const boothCount = await this.getBoothCheckinCount(participantId)

          // Get updated user to check eligibility
          const { data: userData } = await supabase
            .from('users')
            .select('is_eligible_to_draw')
            .eq('id', participantId)
            .single()

          const isEligible = userData?.is_eligible_to_draw || false

          callback({
            boothCount,
            isEligible,
            latestCheckin: newCheckin as BoothCheckin,
          })
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      if (this.progressChannel) {
        supabase.removeChannel(this.progressChannel)
        this.progressChannel = null
      }
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
          const updatedUser = payload.new as DBUser
          callback(updatedUser as User)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}
