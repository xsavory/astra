import { supabase } from './client'
import { BaseAPI } from './base'
import type { User, DrawLog, DrawLogWithDetails } from 'src/types/schema'

/**
 * Draws API with Supabase
 * Handles lucky draw operations using draw_winners join table
 */
export class DrawsAPI extends BaseAPI {
  /**
   * Get eligible participants for draw
   * Returns participants who:
   * - Have is_eligible_to_draw = true
   * - Have NOT won in any previous draws
   */
  async getEligibleParticipants(): Promise<User[]> {
    try {
      // Get all participant IDs who have won before
      const { data: winners, error: winnersError } = await supabase
        .from('draw_winners')
        .select('participant_id')

      if (winnersError) {
        throw winnersError
      }

      const previousWinnerIds = (winners || []).map((w) => w.participant_id)

      // Get eligible participants, excluding previous winners
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'participant')
        .eq('is_eligible_to_draw', true)
        .order('name', { ascending: true })

      // Exclude previous winners if any exist
      if (previousWinnerIds.length > 0) {
        query = query.not('id', 'in', `(${previousWinnerIds.join(',')})`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return (data || []) as User[]
    } catch (error) {
      this.handleError(error, 'getEligibleParticipants')
    }
  }

  /**
   * Submit draw results
   * Creates a draw_log entry and inserts winners into draw_winners table
   */
  async submitDraw(
    winnerIds: string[],
    staffId?: string,
    prizeTemplate?: string,
    prizeName?: string,
    slotCount?: number
  ): Promise<DrawLog> {
    try {
      // Validate winners array
      if (!winnerIds || winnerIds.length === 0) {
        throw new Error('Tidak ada pemenang yang dipilih')
      }

      // Validate all winners are eligible
      const eligibleParticipants = await this.getEligibleParticipants()
      const eligibleIds = eligibleParticipants.map((p) => p.id)

      const invalidWinners = winnerIds.filter((id) => !eligibleIds.includes(id))
      if (invalidWinners.length > 0) {
        throw new Error(
          `Beberapa pemenang tidak eligible atau sudah pernah menang: ${invalidWinners.length} orang`
        )
      }

      // Create draw_log entry with template info
      const { data: drawLogData, error: drawLogError } = await supabase
        .from('draw_logs')
        .insert({
          staff_id: staffId || null,
          prize_template: prizeTemplate || null,
          prize_name: prizeName || null,
          slot_count: slotCount || winnerIds.length,
        })
        .select()
        .single()

      if (drawLogError) {
        throw drawLogError
      }

      if (!drawLogData) {
        throw new Error('Failed to create draw log')
      }

      // Insert winners into draw_winners table
      const winnersData = winnerIds.map((participantId) => ({
        draw_log_id: drawLogData.id,
        participant_id: participantId,
      }))

      const { error: winnersError } = await supabase
        .from('draw_winners')
        .insert(winnersData)

      if (winnersError) {
        // Rollback: delete the draw_log
        await supabase.from('draw_logs').delete().eq('id', drawLogData.id)
        throw winnersError
      }

      return drawLogData as DrawLog
    } catch (error) {
      this.handleError(error, 'submitDraw')
    }
  }

  /**
   * Get all draw logs (with basic info)
   */
  async getDrawLogs(): Promise<DrawLog[]> {
    try {
      const { data, error } = await supabase
        .from('draw_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data || []) as DrawLog[]
    } catch (error) {
      this.handleError(error, 'getDrawLogs')
    }
  }

  /**
   * Get draw log by ID with winner details
   */
  async getDrawLogWithDetails(drawLogId: string): Promise<DrawLogWithDetails> {
    try {
      // Get draw log
      const { data: drawLogData, error: drawLogError } = await supabase
        .from('draw_logs')
        .select('*')
        .eq('id', drawLogId)
        .single()

      if (drawLogError) {
        throw drawLogError
      }

      if (!drawLogData) {
        throw new Error('Draw log not found')
      }

      // Get winners with user details using join
      const { data: winnersData, error: winnersError } = await supabase
        .from('draw_winners')
        .select('participant_id')
        .eq('draw_log_id', drawLogId)

      if (winnersError) {
        throw winnersError
      }

      // Get full user details for each winner
      const winnerIds = (winnersData || []).map((w) => w.participant_id)
      let winners: User[] = []

      if (winnerIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', winnerIds)

        if (usersError) {
          throw usersError
        }

        winners = (usersData || []) as User[]
      }

      // Get staff details if staff_id exists
      let staff: User | undefined

      if (drawLogData.staff_id) {
        const { data: staffData, error: staffError } = await supabase
          .from('users')
          .select('*')
          .eq('id', drawLogData.staff_id)
          .single()

        if (!staffError && staffData) {
          staff = staffData as User
        }
      }

      return {
        ...(drawLogData as DrawLog),
        winners,
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
      const { data, error } = await supabase
        .from('draw_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        throw error
      }

      return data ? (data as DrawLog) : null
    } catch (error) {
      this.handleError(error, 'getLatestDrawLog')
    }
  }

  /**
   * Get draw history with all details
   * Returns all draws with their winners
   */
  async getDrawHistory(): Promise<DrawLogWithDetails[]> {
    try {
      const drawLogs = await this.getDrawLogs()

      // Fetch details for each draw log
      const drawHistoryPromises = drawLogs.map((log) =>
        this.getDrawLogWithDetails(log.id)
      )

      const drawHistory = await Promise.all(drawHistoryPromises)

      return drawHistory
    } catch (error) {
      this.handleError(error, 'getDrawHistory')
    }
  }

  /**
   * Check if a participant has won before
   */
  async hasParticipantWon(participantId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('draw_winners')
        .select('id')
        .eq('participant_id', participantId)
        .limit(1)
        .maybeSingle()

      if (error) {
        throw error
      }

      return data !== null
    } catch (error) {
      this.handleError(error, 'hasParticipantWon')
    }
  }

  /**
   * Get total number of draws conducted
   */
  async getTotalDraws(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('draw_logs')
        .select('id', { count: 'exact', head: true })

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      this.handleError(error, 'getTotalDraws')
    }
  }

  /**
   * Get total number of winners across all draws
   */
  async getTotalWinners(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('draw_winners')
        .select('id', { count: 'exact', head: true })

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      this.handleError(error, 'getTotalWinners')
    }
  }
}
