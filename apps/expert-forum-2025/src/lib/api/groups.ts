import { supabase } from './client'
import { BaseAPI } from './base'
import { MIN_GROUP_SIZE } from 'src/lib/constants'
import type {
  Group,
  GroupWithDetails,
  CreateGroupInput,
  UpdateGroupInput,
  User,
} from 'src/types/schema'

/**
 * Groups API with Supabase
 * Handles group operations for offline participants
 */
export class GroupsAPI extends BaseAPI {
  /**
   * Create new group
   * Groups are for member organization only - ideation content goes to ideations table
   */
  async createGroup(
    creatorId: string,
    data: CreateGroupInput
  ): Promise<Group> {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: data.name,
          creator_id: creatorId,
          is_submitted: false,
        })
        .select()
        .single()

      if (groupError) {
        throw groupError
      }

      if (!groupData) {
        throw new Error('Failed to create group')
      }

      // Update creator's groupId
      const { error: updateError } = await supabase
        .from('users')
        .update({ group_id: groupData.id })
        .eq('id', creatorId)

      if (updateError) {
        // Rollback: delete the group
        await supabase.from('groups').delete().eq('id', groupData.id)
        throw updateError
      }

      return groupData as Group
    } catch (error) {
      this.handleError(error, 'createGroup')
    }
  }

  /**
   * Get group by ID
   */
  async getGroup(groupId: string): Promise<Group> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (error) {
        throw error
      }

      return this.ensureData(data, 'Group not found') as Group
    } catch (error) {
      this.handleError(error, 'getGroup')
    }
  }

  /**
   * Get group with participant details
   */
  async getGroupWithDetails(groupId: string): Promise<GroupWithDetails> {
    try {
      // Fetch group with creator using join
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select(
          `
          *,
          creator:users!groups_creator_id_fkey(*)
        `
        )
        .eq('id', groupId)
        .single()

      if (groupError) {
        throw groupError
      }

      if (!groupData) {
        throw new Error('Group not found')
      }

      // Fetch all participants in the group
      const { data: participantsData, error: participantsError } =
        await supabase
          .from('users')
          .select('*')
          .eq('group_id', groupId)

      if (participantsError) {
        throw participantsError
      }

      return {
        ...groupData,
        creator: groupData.creator as User,
        participants: participantsData as User[],
      }
    } catch (error) {
      this.handleError(error, 'getGroupWithDetails')
    }
  }

  /**
   * Update group details (only name field)
   */
  async updateGroup(
    groupId: string,
    data: UpdateGroupInput
  ): Promise<Group> {
    try {
      const group = await this.getGroup(groupId)

      if (group.is_submitted) {
        throw new Error('Grup sudah di-submit, tidak bisa diubah')
      }

      const updates: Partial<Group> = {}
      if (data.name !== undefined) updates.name = data.name

      const { data: updatedGroup, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return this.ensureData(updatedGroup, 'Group not found') as Group
    } catch (error) {
      this.handleError(error, 'updateGroup')
    }
  }

  /**
   * Invite participant to group
   */
  async inviteToGroup(
    groupId: string,
    participantId: string
  ): Promise<Group> {
    try {
      // Get group
      const group = await this.getGroup(groupId)

      if (group.is_submitted) {
        throw new Error('Grup sudah di-submit, tidak bisa menambah anggota')
      }

      // Validate participant
      const { data: participantData, error: participantError } =
        await supabase
          .from('users')
          .select('*')
          .eq('id', participantId)
          .single()

      if (participantError) {
        throw participantError
      }

      if (!participantData) {
        throw new Error('Participant not found')
      }

      if (participantData.participant_type !== 'offline') {
        throw new Error('Hanya offline participant yang bisa join grup')
      }

      if (participantData.group_id) {
        throw new Error('Participant sudah ada di grup lain')
      }

      // Update participant's groupId
      const { error: updateError } = await supabase
        .from('users')
        .update({ group_id: groupId })
        .eq('id', participantId)

      if (updateError) {
        throw updateError
      }

      // Re-fetch group (participants are now updated via group_id foreign key)
      return await this.getGroup(groupId)
    } catch (error) {
      this.handleError(error, 'inviteToGroup')
    }
  }

  /**
   * Remove participant from group
   */
  async leaveGroup(groupId: string, participantId: string): Promise<Group> {
    try {
      const group = await this.getGroup(groupId)

      if (group.is_submitted) {
        throw new Error('Grup sudah di-submit, tidak bisa keluar')
      }

      // Clear participant's groupId
      const { error } = await supabase
        .from('users')
        .update({ group_id: null })
        .eq('id', participantId)

      if (error) {
        throw error
      }

      // Re-fetch group
      return await this.getGroup(groupId)
    } catch (error) {
      this.handleError(error, 'leaveGroup')
    }
  }

  /**
   * Submit group (validate minimum size)
   * Validates group size in API layer
   */
  async submitGroup(groupId: string): Promise<Group> {
    try {
      // Re-fetch group to ensure real-time data
      const group = await this.getGroup(groupId)

      if (group.is_submitted) {
        throw new Error('Grup sudah di-submit')
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

      // Update group
      const { data: updatedGroup, error: updateError } = await supabase
        .from('groups')
        .update({
          is_submitted: true,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', groupId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return this.ensureData(updatedGroup, 'Group not found') as Group
    } catch (error) {
      this.handleError(error, 'submitGroup')
    }
  }

  /**
   * Get available participants (offline, not in any group)
   * Filters in API layer
   */
  async getAvailableParticipants(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'participant')
        .eq('participant_type', 'offline')
        .eq('is_checked_in', true)
        .is('group_id', null)
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      return (data || []) as User[]
    } catch (error) {
      this.handleError(error, 'getAvailableParticipants')
    }
  }
}
