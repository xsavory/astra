import { supabase } from './client'
import { BaseAPI } from './base'
import { MIN_GROUP_SIZE, MAX_GROUP_SIZE } from 'src/lib/constants'
import type {
  Ideation,
  CreateIdeationInput,
  User,
  Group,
} from 'src/types/schema'

/**
 * Handles ideation submission for both individual and group
 * Updated to support multiple submissions per participant
 */
export class IdeationsAPI extends BaseAPI {
  /**
   * Create individual ideation (online participants)
   * Participants can submit multiple ideations with different company cases
   */
  async createIndividualIdeation(
    creatorId: string,
    data: CreateIdeationInput
  ): Promise<Ideation> {
    try {
      // Create ideation
      const { data: ideationData, error: ideationError } = await supabase
        .from('ideations')
        .insert({
          title: data.title,
          description: data.description,
          company_case: data.company_case,
          creator_id: creatorId,
          group_id: null, // Individual ideation
          is_group: false,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (ideationError) {
        throw ideationError
      }

      return ideationData as Ideation
    } catch (error) {
      this.handleError(error, 'createIndividualIdeation')
    }
  }

  /**
   * Create group ideation from existing group
   * Groups are NOT reusable - one group can only submit one ideation
   * Validation rules:
   * - Group must not have submitted before (is_submitted = false)
   * - Exactly 2 members
   * - Members from different companies
   * - Company case must not match any member's company
   */
  async createGroupIdeation(
    groupId: string,
    data: CreateIdeationInput
  ): Promise<Ideation> {
    try {
      // Get group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (groupError) {
        throw groupError
      }

      if (!groupData) {
        throw new Error('Group not found')
      }

      // Check if group has already submitted
      if (groupData.is_submitted) {
        throw new Error(
          'Grup sudah pernah submit ideation. Silakan buat grup baru untuk submit ideation lainnya.'
        )
      }

      // Get group members via junction table
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('participant_id')
        .eq('group_id', groupId)

      if (membersError) {
        throw membersError
      }

      const participantIds = (membersData || []).map((m) => m.participant_id)

      // Validate group size (must be exactly 2)
      if (participantIds.length < MIN_GROUP_SIZE) {
        throw new Error(
          `Grup minimal ${MIN_GROUP_SIZE} anggota. Saat ini: ${participantIds.length} anggota`
        )
      }

      if (participantIds.length > MAX_GROUP_SIZE) {
        throw new Error(
          `Grup maksimal ${MAX_GROUP_SIZE} anggota. Saat ini: ${participantIds.length} anggota`
        )
      }

      // Fetch participant details
      const { data: participantsData, error: participantsError } =
        await supabase
          .from('users')
          .select('*')
          .in('id', participantIds)

      if (participantsError) {
        throw participantsError
      }

      if (!participantsData || participantsData.length !== participantIds.length) {
        throw new Error('Failed to fetch all group members')
      }

      const participants = participantsData as User[]

      // Validate: members must be from different companies
      const companies = participants
        .map((p) => p.company)
        .filter((c) => c !== null && c !== undefined)

      if (companies.length !== participants.length) {
        throw new Error('Semua anggota grup harus memiliki company yang terdaftar')
      }

      const uniqueCompanies = new Set(companies)
      if (uniqueCompanies.size !== companies.length) {
        throw new Error(
          'Anggota grup harus berasal dari company yang berbeda'
        )
      }

      // Validate: company_case must not match any member's company
      const memberCompanies = companies.map((c) => c.toLowerCase())
      const selectedCompanyCase = data.company_case.toLowerCase()

      if (memberCompanies.includes(selectedCompanyCase)) {
        throw new Error(
          'Company case yang dipilih tidak boleh sama dengan company dari anggota grup'
        )
      }

      // Create ideation with provided data
      const { data: ideationData, error: ideationError } = await supabase
        .from('ideations')
        .insert({
          title: data.title,
          description: data.description,
          company_case: data.company_case,
          creator_id: groupData.creator_id,
          group_id: groupId,
          is_group: true,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (ideationError) {
        throw ideationError
      }

      // Lock the group after successful ideation submission
      const { error: lockError } = await supabase
        .from('groups')
        .update({
          is_submitted: true,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', groupId)

      if (lockError) {
        // Ideation was created but group lock failed
        // This is a critical error - log it but don't fail the request
        console.error('Failed to lock group after ideation submission:', lockError)
        // Consider implementing a cleanup mechanism or retry logic
      }

      return ideationData as Ideation
    } catch (error) {
      this.handleError(error, 'createGroupIdeation')
    }
  }

  /**
   * Get all submitted ideations
   * All ideations in the table are submitted (submitted_at is set on insert)
   */
  async getIdeations(): Promise<Ideation[]> {
    try {
      const { data, error } = await supabase
        .from('ideations')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) {
        throw error
      }

      return data as Ideation[]
    } catch (error) {
      this.handleError(error, 'getIdeations')
    }
  }

  /**
   * Get paginated ideations with filters (for admin dashboard)
   */
  async getIdeationsWithFilters(options?: {
    page?: number
    limit?: number
    filters?: {
      is_group?: boolean
      company_case?: string
      search?: string
    }
  }): Promise<{
    items: Array<Ideation & { creator: User }>
    total: number
    page: number
    limit: number
    total_pages: number
  }> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 10
      const filters = options?.filters || {}
      const offset = (page - 1) * limit

      // Build query with creator join
      let query = supabase
        .from('ideations')
        .select('*, creator:users!creator_id(*)', { count: 'exact' })
        .order('submitted_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (filters.is_group !== undefined) {
        query = query.eq('is_group', filters.is_group)
      }

      if (filters.company_case) {
        query = query.eq('company_case', filters.company_case)
      }

      if (filters.search) {
        // Search by title or description (can't search joined table with OR)
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        )
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      const total = count || 0
      const items = (data || []) as Array<Ideation & { creator: User }>

      return {
        items,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      }
    } catch (error) {
      this.handleError(error, 'getIdeationsWithFilters')
    }
  }

  /**
   * Get ideations for staff display with participants
   * Optimized for stage presentation - fetches limited ideations with creator and group member details
   * Uses nested joins to fetch all data in a single query (no N+1 problem)
   */
  async getIdeationsForStaffDisplay(
    limit: number
  ): Promise<Array<Ideation & { creator: User; participants?: User[] }>> {
    try {
      // Fetch ideations with nested joins:
      // - creator (direct FK)
      // - group → group_members → participant (users)
      const { data, error } = await supabase
        .from('ideations')
        .select(`
          *,
          creator:users!creator_id(*),
          group:groups!group_id(
            id,
            group_members(
              participant:users!participant_id(*)
            )
          )
        `)
        .order('submitted_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      // Transform the nested data structure to match expected output
      const ideations = (data || []).map((item) => {
        // Extract participants from nested group_members
        let participants: User[] | undefined

        if (item.is_group && item.group) {
          const groupData = item.group as {
            id: string
            group_members: Array<{ participant: User }>
          }

          if (groupData.group_members && groupData.group_members.length > 0) {
            participants = groupData.group_members
              .map((member) => member.participant)
              .filter((p): p is User => p !== null)
              .sort((a, b) => a.name.localeCompare(b.name))
          }
        }

        // Return clean structure without nested group data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { group, ...ideationData } = item

        return {
          ...ideationData,
          creator: item.creator as User,
          participants,
        } as Ideation & { creator: User; participants?: User[] }
      })

      return ideations
    } catch (error) {
      this.handleError(error, 'getIdeationsForStaffDisplay')
    }
  }

  /**
   * Get all ideations for export (no pagination)
   */
  async getAllIdeationsForExport(): Promise<Array<Ideation & { creator: User }>> {
    try {
      const { data, error } = await supabase
        .from('ideations')
        .select('*, creator:users!creator_id(*)')
        .order('submitted_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data || []) as Array<Ideation & { creator: User }>
    } catch (error) {
      this.handleError(error, 'getAllIdeationsForExport')
    }
  }

  /**
   * Get ideation by ID
   */
  async getIdeation(ideationId: string): Promise<Ideation> {
    try {
      const { data, error } = await supabase
        .from('ideations')
        .select('*')
        .eq('id', ideationId)
        .single()

      if (error) {
        throw error
      }

      return this.ensureData(data, 'Ideation not found') as Ideation
    } catch (error) {
      this.handleError(error, 'getIdeation')
    }
  }

  /**
   * Get ideation with participant details (creator, group, participants)
   */
  async getIdeationWithDetails(
    ideationId: string
  ): Promise<{
    ideation: Ideation
    creator: User
    group?: Group | null
    participants?: User[]
  }> {
    try {
      // Get ideation
      const { data: ideationData, error: ideationError } = await supabase
        .from('ideations')
        .select('*')
        .eq('id', ideationId)
        .single()

      if (ideationError) {
        throw ideationError
      }

      if (!ideationData) {
        throw new Error('Ideation not found')
      }

      const ideation = ideationData as Ideation

      // Get creator
      const { data: creatorData, error: creatorError } = await supabase
        .from('users')
        .select('*')
        .eq('id', ideation.creator_id)
        .single()

      if (creatorError) {
        throw creatorError
      }

      const creator = creatorData as User

      // If group ideation, get group and participants
      if (ideation.is_group && ideation.group_id) {
        // Get group
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', ideation.group_id)
          .single()

        if (groupError) {
          throw groupError
        }

        const group = groupData as Group

        // Get all participants in the group via junction table
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select('participant_id')
          .eq('group_id', ideation.group_id)

        if (membersError) {
          throw membersError
        }

        const participantIds = (membersData || []).map((m) => m.participant_id)

        let participants: User[] = []
        if (participantIds.length > 0) {
          const { data: participantsData, error: participantsError } =
            await supabase
              .from('users')
              .select('*')
              .in('id', participantIds)
              .order('name', { ascending: true })

          if (participantsError) {
            throw participantsError
          }

          participants = participantsData as User[]
        }

        return {
          ideation,
          creator,
          group,
          participants,
        }
      }

      // Individual ideation (no group)
      return {
        ideation,
        creator,
      }
    } catch (error) {
      this.handleError(error, 'getIdeationWithDetails')
    }
  }

  /**
   * Get all ideations by creator ID
   * Returns array of ideations (supports multiple submissions)
   */
  async getIdeationsByCreator(creatorId: string): Promise<Ideation[]> {
    try {
      const { data, error } = await supabase
        .from('ideations')
        .select('*')
        .eq('creator_id', creatorId)
        .order('submitted_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data || []) as Ideation[]
    } catch (error) {
      this.handleError(error, 'getIdeationsByCreator')
    }
  }

  /**
   * Get ideations by group ID
   * Returns all ideations submitted by a specific group
   */
  async getIdeationsByGroup(groupId: string): Promise<Ideation[]> {
    try {
      const { data, error } = await supabase
        .from('ideations')
        .select('*')
        .eq('group_id', groupId)
        .order('submitted_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data || []) as Ideation[]
    } catch (error) {
      this.handleError(error, 'getIdeationsByGroup')
    }
  }

  /**
   * Check if a participant has submitted a specific company case
   * Useful for validation before submission
   */
  async hasSubmittedCompanyCase(
    participantId: string,
    companyCase: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ideations')
        .select('id')
        .eq('creator_id', participantId)
        .eq('company_case', companyCase)
        .maybeSingle()

      if (error) {
        throw error
      }

      return data !== null
    } catch (error) {
      this.handleError(error, 'hasSubmittedCompanyCase')
    }
  }

  /**
   * Select an ideation as winner
   * Sets is_winner to true for the specified ideation
   */
  async selectAsWinner(ideationId: string): Promise<Ideation> {
    try {
      const { data, error } = await supabase
        .from('ideations')
        .update({ is_winner: true })
        .eq('id', ideationId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return this.ensureData(data, 'Failed to select ideation as winner') as Ideation
    } catch (error) {
      this.handleError(error, 'selectAsWinner')
    }
  }

  /**
   * Unselect an ideation as winner
   * Sets is_winner to false for the specified ideation
   */
  async unselectAsWinner(ideationId: string): Promise<Ideation> {
    try {
      const { data, error } = await supabase
        .from('ideations')
        .update({ is_winner: false })
        .eq('id', ideationId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return this.ensureData(data, 'Failed to unselect ideation as winner') as Ideation
    } catch (error) {
      this.handleError(error, 'unselectAsWinner')
    }
  }

  /**
   * Get all winner ideations with creator details
   * Returns only ideations where is_winner is true
   */
  async getWinners(): Promise<Array<Ideation & { creator: User }>> {
    try {
      const { data, error } = await supabase
        .from('ideations')
        .select('*, creator:users!creator_id(*)')
        .eq('is_winner', true)
        .order('submitted_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data || []) as Array<Ideation & { creator: User }>
    } catch (error) {
      this.handleError(error, 'getWinners')
    }
  }

  /**
   * Subscribe to realtime ideation changes
   * Triggers callback when new ideations are inserted
   *
   * @param callback - Called when a new ideation is inserted
   * @returns Unsubscribe function
   */
  subscribeToIdeations(callback: (ideation: Ideation) => void): () => void {
    const channel = supabase
      .channel('ideations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ideations',
        },
        (payload) => {
          const newIdeation = payload.new as Ideation
          callback(newIdeation)
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel)
    }
  }
}
