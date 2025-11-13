import { supabase } from './client'
import { BaseAPI } from './base'
import type { BoothVoteResultWithDetails, BoothWithVoteStats, Booth } from 'src/types/schema'

/**
 * Vote Results API with Supabase
 * Handles final voting results submission and retrieval
 * Results are immutable once submitted and lock further voting
 */
export class VoteResultsAPI extends BaseAPI {
  /**
   * Submit final voting results
   * Takes a snapshot of current votes, saves to booth_votes_results table,
   * and locks voting by setting is_votes_lock = true
   *
   * This operation is transaction-like to ensure data consistency:
   * 1. Gets all current booth votes with stats
   * 2. Inserts results into booth_votes_results
   * 3. Updates event to set is_votes_lock = true
   *
   * @param eventId - The event ID to finalize results for
   * @param staffId - The staff member performing the finalization
   * @param currentBoothStats - Current booth statistics to snapshot
   */
  async submitFinalResults(
    eventId: string,
    staffId: string,
    currentBoothStats: BoothWithVoteStats[]
  ): Promise<void> {
    try {
      // Check if results already exist for this event
      const { data: existing } = await supabase
        .from('booth_votes_results')
        .select('id')
        .eq('event_id', eventId)
        .limit(1)

      if (existing && existing.length > 0) {
        throw new Error('Voting results have already been submitted for this event')
      }

      // Prepare results data for insertion
      const resultsToInsert = currentBoothStats.map((booth) => ({
        event_id: eventId,
        booth_id: booth.id,
        final_vote_count: booth.vote_count,
        final_rank: booth.rank,
        submitted_by: staffId,
      }))

      // Insert all results
      const { error: insertError } = await supabase
        .from('booth_votes_results')
        .insert(resultsToInsert)

      if (insertError) {
        console.error('Failed to insert results:', insertError)
        throw insertError
      }

      // Lock voting by updating event
      const { data: updateData, error: updateError } = await supabase
        .from('events')
        .update({ is_votes_lock: true })
        .eq('id', eventId)
        .select()

      if (updateError) {
        console.error('Failed to update event:', updateError)
        throw updateError
      }

      if (!updateData || updateData.length === 0) {
        throw new Error(`Event with id ${eventId} not found or not updated`)
      }
    } catch (error) {
      this.handleError(error, 'submitFinalResults')
    }
  }

  /**
   * Get final results for an event
   * Returns all booth results with populated booth, event, and staff data
   *
   * @param eventId - The event ID to get results for
   * @returns Array of final results with details
   */
  async getFinalResults(eventId: string): Promise<BoothVoteResultWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('booth_votes_results')
        .select(`
          *,
          booth:booths(*),
          event:events(*),
          staff:users!booth_votes_results_submitted_by_fkey(*)
        `)
        .eq('event_id', eventId)
        .order('final_rank', { ascending: true })

      if (error) {
        throw error
      }

      // Transform data to match schema types
      return (data || []).map((result) => ({
        ...result,
        booth: result.booth ? this.transformBooth(result.booth) : undefined,
      })) as BoothVoteResultWithDetails[]
    } catch (error) {
      this.handleError(error, 'getFinalResults')
    }
  }

  /**
   * Transform database booth to schema Booth
   */
  private transformBooth(dbBooth: unknown): Booth {
    const booth = dbBooth as Record<string, unknown>
    return {
      ...booth,
      questions: Array.isArray(booth.questions) ? booth.questions : [],
    } as Booth
  }

  /**
   * Check if results have been submitted for an event
   *
   * @param eventId - The event ID to check
   * @returns True if results exist, false otherwise
   */
  async hasResults(eventId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('booth_votes_results')
        .select('id')
        .eq('event_id', eventId)
        .limit(1)

      if (error) {
        throw error
      }

      return data !== null && data.length > 0
    } catch (error) {
      this.handleError(error, 'hasResults')
    }
  }
}
