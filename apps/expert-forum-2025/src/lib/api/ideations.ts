import { supabase } from './client'
import { BaseAPI } from './base'
import { MIN_GROUP_SIZE } from 'src/lib/constants'
import type {
  Ideation,
  CreateIdeationInput,
  User,
  Group,
} from 'src/types/schema'

/**
 * Handles ideation submission for both individual and group
 */
export class IdeationsAPI extends BaseAPI {
  /**
   * Create individual ideation (online participants)
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

      // Check if already submitted
      const { data: existingIdeation, error: existingError } = await supabase
        .from('ideations')
        .select('id')
        .eq('creator_id', creatorId)
        .maybeSingle()

      if (existingError) {
        throw existingError
      }

      if (existingIdeation) {
        throw new Error('Participant sudah submit ideation')
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
   * Groups now only store member organization, ideation content must be provided
   * This method also updates group.is_submitted to true
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

      if (groupData.is_submitted) {
        throw new Error('Grup sudah submit ideation')
      }

      // Check if group already has ideation
      const { data: existingIdeation, error: existingError } = await supabase
        .from('ideations')
        .select('id')
        .eq('group_id', groupId)
        .maybeSingle()

      if (existingError) {
        throw existingError
      }

      if (existingIdeation) {
        throw new Error('Grup sudah memiliki ideation')
      }

      // Get group member count (business logic in API layer)
      const { count: memberCount, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId)

      if (countError) {
        throw countError
      }

      // Validate minimum group size
      if (!memberCount || memberCount < MIN_GROUP_SIZE) {
        throw new Error(
          `Grup minimal ${MIN_GROUP_SIZE} anggota. Saat ini: ${memberCount || 0} anggota`
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

      // Update group.is_submitted to true after ideation creation
      const { error: updateGroupError } = await supabase
        .from('groups')
        .update({
          is_submitted: true,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', groupId)

      if (updateGroupError) {
        // Rollback: delete the ideation
        await supabase.from('ideations').delete().eq('id', ideationData.id)
        throw updateGroupError
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

        // Get all participants in the group
        const { data: participantsData, error: participantsError } =
          await supabase
            .from('users')
            .select('*')
            .eq('group_id', ideation.group_id)
            .order('name', { ascending: true })

        if (participantsError) {
          throw participantsError
        }

        const participants = participantsData as User[]

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
   * Get ideation by creator ID
   */
  async getIdeationByCreator(creatorId: string): Promise<Ideation | null> {
    try {
      const { data, error } = await supabase
        .from('ideations')
        .select('*')
        .eq('creator_id', creatorId)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!data) {
        return null
      }

      return data as Ideation
    } catch (error) {
      this.handleError(error, 'getIdeationByCreator')
    }
  }
}
