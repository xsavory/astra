import { supabase } from './client'
import { BaseAPI } from './base'
import type { Database } from 'src/types/database'
import type { Booth } from 'src/types/schema'
import type { RealtimeChannel } from '@supabase/supabase-js'

type DBBooth = Database['public']['Tables']['booths']['Row']

/**
 * Booths API with Supabase
 * Handles booth data operations with realtime subscriptions
 */
export class BoothsAPI extends BaseAPI {
  private boothChannel: RealtimeChannel | null = null

  /**
   * Get all booths ordered by order field
   * Questions are stored as JSONB array and returned as string[]
   */
  async getBooths(): Promise<Booth[]> {
    try {
      const { data, error } = await supabase
        .from('booths')
        .select('*')
        .order('order', { ascending: true })

      if (error) {
        throw error
      }

      return (data || []).map((booth) => this.transformBooth(booth))
    } catch (error) {
      this.handleError(error, 'getBooths')
    }
  }

  /**
   * Transform database booth to schema Booth
   * Converts JSONB questions to string array
   */
  private transformBooth(dbBooth: DBBooth): Booth {
    return {
      ...dbBooth,
      questions: Array.isArray(dbBooth.questions)
        ? dbBooth.questions as string[]
        : [],
    } as Booth
  }

  /**
   * Get booth by ID
   * Questions are stored as JSONB array and returned as string[]
   */
  async getBooth(boothId: string): Promise<Booth> {
    try {
      const { data, error } = await supabase
        .from('booths')
        .select('*')
        .eq('id', boothId)
        .single()

      if (error) {
        throw error
      }

      const booth = this.ensureData(data, 'Booth not found') as DBBooth
      return this.transformBooth(booth)
    } catch (error) {
      this.handleError(error, 'getBooth')
    }
  }

  /**
   * Get a random question from booth's questions array
   * Frontend helper to randomly select one question for participant
   */
  getRandomQuestion(booth: Booth): string {
    if (!booth.questions || booth.questions.length === 0) {
      throw new Error('Booth has no questions')
    }

    const randomIndex = Math.floor(Math.random() * booth.questions.length)
    return booth.questions[randomIndex] as string
  }

  /**
   * Subscribe to booth updates (Realtime Feature #3)
   *
   * This enables real-time booth management:
   * - Automatically updates when booth data changes
   * - Triggers when booths are added, updated, or deleted
   * - Keeps booth list synchronized across all clients
   * - Useful for admin panel or when booths are dynamically managed
   *
   * @param callback - Called when booth data changes
   * @returns Unsubscribe function
   */
  subscribeToBooths(
    callback: (event: 'INSERT' | 'UPDATE' | 'DELETE', booth: Booth | null) => void
  ): () => void {
    this.boothChannel = supabase
      .channel('booths')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booths',
        },
        (payload) => {
          const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'

          if (event === 'DELETE') {
            // For DELETE events, only old data is available
            const oldBooth = payload.old as DBBooth
            callback('DELETE', oldBooth ? oldBooth as Booth : null)
          } else {
            // For INSERT and UPDATE, use new data
            const newBooth = payload.new as DBBooth
            callback(event, newBooth as Booth)
          }
        }
      )
      .subscribe()

    return () => {
      if (this.boothChannel) {
        supabase.removeChannel(this.boothChannel)
        this.boothChannel = null
      }
    }
  }

  /**
   * Subscribe to booth checkin completion for a specific participant
   *
   * This enables real-time booth completion tracking:
   * - Watches booth_checkins table for new entries
   * - Updates booth visited status in real-time
   * - Powers UI updates when participant completes a booth
   *
   * @param participantId - The participant to track
   * @param callback - Called when participant completes a booth with booth ID
   * @returns Unsubscribe function
   */
  subscribeToBoothCompletion(
    participantId: string,
    callback: (boothId: string) => void
  ): () => void {
    const channel = supabase
      .channel(`booth-completion:${participantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'booth_checkins',
          filter: `participant_id=eq.${participantId}`,
        },
        (payload) => {
          const checkin = payload.new as { booth_id: string }
          callback(checkin.booth_id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}
