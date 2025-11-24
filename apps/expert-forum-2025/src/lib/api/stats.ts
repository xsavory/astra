import { supabase } from './client'
import { BaseAPI } from './base'
import type { Stats, SignInStats } from 'src/types/schema'

/**
 * Stats API with Supabase
 * Handles statistics calculations for admin dashboard
 * Uses PostgreSQL views for optimized queries
 */
export class StatsAPI extends BaseAPI {
  /**
   * Get dashboard statistics using PostgreSQL views
   */
  async getStats(): Promise<Stats> {
    try {
      // Use the views we created in schema.sql for optimized queries
      const { data: participantStats, error: participantError } = await supabase
        .from('participant_stats')
        .select('*')
        .single()

      if (participantError) {
        throw participantError
      }

      const { data: submissionStats, error: submissionError } = await supabase
        .from('submission_stats')
        .select('*')
        .single()

      if (submissionError) {
        throw submissionError
      }

      return {
        totalParticipants: {
          total: participantStats?.total_participants || 0,
          offline: participantStats?.total_offline || 0,
          online: participantStats?.total_online || 0,
        },
        checkedIn: {
          total: participantStats?.total_checked_in || 0,
          offline: participantStats?.checked_in_offline || 0,
          online: participantStats?.checked_in_online || 0,
        },
        eligibleForDraw: participantStats?.total_eligible_for_draw || 0,
        submissions: {
          total: submissionStats?.total_submissions || 0,
          group: submissionStats?.group_submissions || 0,
          individual: submissionStats?.individual_submissions || 0,
        },
      }
    } catch (error) {
      this.handleError(error, 'getStats')
    }
  }

  /**
   * Get total participants count
   */
  async getTotalParticipants(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'participant')

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      this.handleError(error, 'getTotalParticipants')
    }
  }

  /**
   * Get checked-in participants count
   */
  async getCheckedInCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'participant')
        .eq('is_checked_in', true)

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      this.handleError(error, 'getCheckedInCount')
    }
  }

  /**
   * Get eligible for draw count
   */
  async getEligibleCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'participant')
        .eq('is_eligible_to_draw', true)

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      this.handleError(error, 'getEligibleCount')
    }
  }

  /**
   * Get submissions count
   */
  async getSubmissionsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('ideations')
        .select('*', { count: 'exact', head: true })
        .eq('is_submitted', true)

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      this.handleError(error, 'getSubmissionsCount')
    }
  }

  /**
   * Get sign-in statistics (excluding test users)
   * Returns total signed in participants broken down by type
   */
  async getSignInStats(): Promise<SignInStats> {
    try {
      const { data, error } = await supabase
        .from('signin_stats')
        .select('*')
        .single()

      if (error) {
        throw error
      }

      return {
        total: data?.total_signed_in || 0,
        offline: data?.offline_signed_in || 0,
        online: data?.online_signed_in || 0,
      }
    } catch (error) {
      this.handleError(error, 'getSignInStats')
    }
  }
}
