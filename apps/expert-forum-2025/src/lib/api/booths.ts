import { supabase } from './client'
import { BaseAPI } from './base'
import type { Database } from 'src/types/database'
import type { Booth, BoothQuestion } from 'src/types/schema'
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
   * Questions are stored as JSONB array and returned as BoothQuestion[]
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
   * Converts JSONB questions to BoothQuestion array
   */
  private transformBooth(dbBooth: DBBooth): Booth {
    return {
      ...dbBooth,
      questions: Array.isArray(dbBooth.questions)
        ? (dbBooth.questions as unknown as BoothQuestion[])
        : [],
    } as Booth
  }

  /**
   * Get booth by ID
   * Questions are stored as JSONB array and returned as BoothQuestion[]
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
   * Get a random starting question index from booth's questions array
   * Frontend helper to randomly select starting position for question sequence
   *
   * @returns Random index (0-4) for starting question
   */
  getRandomQuestionIndex(booth: Booth): number {
    if (!booth.questions || booth.questions.length === 0) {
      throw new Error('Booth has no questions')
    }

    return Math.floor(Math.random() * booth.questions.length)
  }

  /**
   * Validate if selected answer is correct
   *
   * @param booth - The booth containing questions
   * @param questionIndex - Index of the question being answered
   * @param selectedAnswer - Index of the selected option (0-3)
   * @returns true if answer is correct, false otherwise
   */
  validateAnswer(booth: Booth, questionIndex: number, selectedAnswer: number): boolean {
    if (!booth.questions || questionIndex >= booth.questions.length || questionIndex < 0) {
      throw new Error('Invalid question index')
    }

    const question = booth.questions[questionIndex]
    if (!question) {
      throw new Error('Question not found')
    }
    return question.correct_answer === selectedAnswer
  }

  /**
   * Calculate points based on number of attempts
   * Point distribution: 1st=100, 2nd=80, 3rd=60, 4th=40, 5th=20, 6+=10
   *
   * @param attempts - Number of attempts before correct answer
   * @returns Points earned (10-100)
   */
  calculatePoints(attempts: number): number {
    if (attempts === 1) return 100
    if (attempts === 2) return 80
    if (attempts === 3) return 60
    if (attempts === 4) return 40
    if (attempts === 5) return 20
    return 10 // 6+ attempts
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
            callback('DELETE', oldBooth ? this.transformBooth(oldBooth) : null)
          } else {
            // For INSERT and UPDATE, use new data
            const newBooth = payload.new as DBBooth
            callback(event, this.transformBooth(newBooth))
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
