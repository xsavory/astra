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
      // Validate creator is online participant
      const { data: creatorData, error: creatorError } = await supabase
        .from('users')
        .select('*')
        .eq('id', creatorId)
        .single()

      if (creatorError) {
        throw creatorError
      }

      if (!creatorData) {
        throw new Error('Creator not found')
      }

      if (creatorData.participant_type !== 'online') {
        throw new Error(
          'Hanya online participant yang bisa submit ideation individual'
        )
      }

      // Check if company case already submitted by this participant
      const { data: existingIdeation, error: existingError } = await supabase
        .from('ideations')
        .select('id')
        .eq('creator_id', creatorId)
        .eq('company_case', data.company_case)
        .eq('is_group', false)
        .maybeSingle()

      if (existingError) {
        throw existingError
      }

      if (existingIdeation) {
        throw new Error(
          `Anda sudah submit ideation untuk company case "${data.company_case}". Silakan pilih company case yang berbeda.`
        )
      }

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
   * - Neither member has submitted this company case before
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

      // Validate: neither member has submitted this company case before
      const { data: existingIdeations, error: ideationsError } = await supabase
        .from('ideations')
        .select('creator_id, company_case')
        .in('creator_id', participantIds)
        .eq('company_case', data.company_case)

      if (ideationsError) {
        throw ideationsError
      }

      if (existingIdeations && existingIdeations.length > 0) {
        // Find which member(s) already submitted this company case
        const conflictingMembers = participants.filter((p) =>
          existingIdeations.some((i) => i.creator_id === p.id)
        )

        const memberNames = conflictingMembers.map((m) => m.name).join(', ')
        throw new Error(
          `Anggota grup (${memberNames}) sudah pernah submit ideation untuk company case "${data.company_case}". Silakan pilih company case yang berbeda.`
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
}
