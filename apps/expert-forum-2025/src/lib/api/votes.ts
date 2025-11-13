import { supabase } from './client'
import { BaseAPI } from './base'
import type { BoothVote, BoothVoteWithBooth, SubmitBoothVotesInput, Booth, BoothWithVoteStats } from 'src/types/schema'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Votes API with Supabase
 * Handles booth voting operations with realtime subscriptions
 * Each participant can vote for exactly 2 booths, votes are immutable
 */
export class VotesAPI extends BaseAPI {
  private voteChannel: RealtimeChannel | null = null

  /**
   * Get all votes for a specific participant
   * Returns votes with populated booth data
   *
   * @param participantId - The participant's user ID
   * @returns Array of booth votes with booth details
   */
  async getUserVotes(participantId: string): Promise<BoothVoteWithBooth[]> {
    try {
      const { data, error } = await supabase
        .from('booth_votes')
        .select(`
          *,
          booth:booths(*)
        `)
        .eq('participant_id', participantId)
        .order('voted_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data || []).map((vote) => this.transformVoteWithBooth(vote))
    } catch (error) {
      this.handleError(error, 'getUserVotes')
    }
  }

  /**
   * Submit votes for exactly 2 booths
   * Validates that exactly 2 unique booth IDs are provided
   * Uses transaction to ensure atomicity (all or nothing)
   *
   * @param participantId - The participant's user ID
   * @param input - Object containing exactly 2 booth IDs
   * @returns Array of created booth votes
   */
  async submitVotes(participantId: string, input: SubmitBoothVotesInput): Promise<BoothVote[]> {
    try {
      // Validate exactly 2 booth IDs
      if (input.booth_ids.length !== 2) {
        throw new Error('You must vote for exactly 2 booths')
      }

      // Validate booth IDs are unique
      const uniqueBoothIds = new Set(input.booth_ids)
      if (uniqueBoothIds.size !== 2) {
        throw new Error('You must vote for 2 different booths')
      }

      // Check if user has already voted
      const existingVotes = await this.getUserVotes(participantId)
      if (existingVotes.length > 0) {
        throw new Error('You have already submitted your votes')
      }

      // Verify booths exist
      const { data: booths, error: boothError } = await supabase
        .from('booths')
        .select('id')
        .in('id', input.booth_ids)

      if (boothError) {
        throw boothError
      }

      if (!booths || booths.length !== 2) {
        throw new Error('One or more selected booths do not exist')
      }

      // Insert votes (both must succeed or both fail)
      const votesToInsert = input.booth_ids.map((booth_id) => ({
        participant_id: participantId,
        booth_id,
      }))

      const { data, error } = await supabase
        .from('booth_votes')
        .insert(votesToInsert)
        .select()

      if (error) {
        throw error
      }

      return (data || []) as BoothVote[]
    } catch (error) {
      this.handleError(error, 'submitVotes')
    }
  }

  /**
   * Get vote counts for all booths
   * Useful for analytics and admin dashboard
   *
   * @returns Map of booth IDs to vote counts
   */
  async getBoothVoteCounts(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('booth_votes')
        .select('booth_id')

      if (error) {
        throw error
      }

      // Count votes per booth
      const voteCounts: Record<string, number> = {}
      data?.forEach((vote) => {
        voteCounts[vote.booth_id] = (voteCounts[vote.booth_id] || 0) + 1
      })

      return voteCounts
    } catch (error) {
      this.handleError(error, 'getBoothVoteCounts')
    }
  }

  /**
   * Get total number of participants who have voted
   *
   * @returns Number of unique participants who have submitted votes
   */
  async getTotalVoters(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('booth_votes')
        .select('participant_id')

      if (error) {
        throw error
      }

      // Count unique participants
      const uniqueParticipants = new Set(data?.map((vote) => vote.participant_id))
      return uniqueParticipants.size
    } catch (error) {
      this.handleError(error, 'getTotalVoters')
    }
  }

  /**
   * Get all booths with their vote statistics
   * Returns booths sorted by vote count (descending) with rankings
   * Useful for staff votes display page
   *
   * @returns Array of booths with vote counts, percentages, and rankings
   */
  async getAllBoothVotesWithDetails(): Promise<BoothWithVoteStats[]> {
    try {
      // Fetch all booths
      const { data: booths, error: boothsError } = await supabase
        .from('booths')
        .select('*')
        .order('order', { ascending: true })

      if (boothsError) {
        throw boothsError
      }

      // Fetch all votes
      const { data: votes, error: votesError } = await supabase
        .from('booth_votes')
        .select('booth_id')

      if (votesError) {
        throw votesError
      }

      // Count votes per booth
      const voteCounts: Record<string, number> = {}
      votes?.forEach((vote) => {
        voteCounts[vote.booth_id] = (voteCounts[vote.booth_id] || 0) + 1
      })

      // Map booths to BoothWithVoteStats
      const boothsWithStats: BoothWithVoteStats[] = (booths || []).map((booth) => {
        const vote_count = voteCounts[booth.id] || 0

        return {
          ...this.transformBooth(booth),
          vote_count,
          vote_percentage: 0, // Not used, set to 0
          rank: 0, // Will be set after sorting
        }
      })

      // Sort by vote count (descending), then by name for stable sorting
      boothsWithStats.sort((a, b) => {
        if (b.vote_count !== a.vote_count) {
          return b.vote_count - a.vote_count
        }
        return a.name.localeCompare(b.name)
      })

      // Assign sequential ranks (1, 2, 3, 4, ...)
      boothsWithStats.forEach((booth, index) => {
        booth.rank = index + 1
      })

      return boothsWithStats
    } catch (error) {
      this.handleError(error, 'getAllBoothVotesWithDetails')
    }
  }

  /**
   * Subscribe to user's vote changes (Realtime Feature)
   *
   * This enables real-time voting updates:
   * - Automatically updates when user submits votes
   * - Triggers callback when votes are added
   * - Keeps UI synchronized with database
   *
   * @param participantId - The participant to track
   * @param callback - Called when votes change
   * @returns Unsubscribe function
   */
  subscribeToUserVotes(
    participantId: string,
    callback: (votes: BoothVote[]) => void
  ): () => void {
    this.voteChannel = supabase
      .channel(`user-votes:${participantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'booth_votes',
          filter: `participant_id=eq.${participantId}`,
        },
        async () => {
          // Refetch all votes when new vote is inserted
          const votes = await this.getUserVotes(participantId)
          callback(votes)
        }
      )
      .subscribe()

    return () => {
      if (this.voteChannel) {
        supabase.removeChannel(this.voteChannel)
        this.voteChannel = null
      }
    }
  }

  /**
   * Transform database vote with populated booth to schema type
   */
  private transformVoteWithBooth(dbVote: {
    id: string
    participant_id: string
    booth_id: string
    voted_at: string
    booth?: unknown
  }): BoothVoteWithBooth {
    return {
      id: dbVote.id,
      participant_id: dbVote.participant_id,
      booth_id: dbVote.booth_id,
      voted_at: dbVote.voted_at,
      booth: dbVote.booth ? this.transformBooth(dbVote.booth) : undefined,
    }
  }

  /**
   * Transform database booth to schema Booth
   */
  private transformBooth(dbBooth: unknown): Booth {
    const booth = dbBooth as Record<string, unknown>
    return {
      ...booth,
      questions: Array.isArray(booth.questions)
        ? booth.questions
        : [],
    } as Booth
  }
}
