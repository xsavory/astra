import { supabase } from './client'
import { BaseAPI } from './base'
import type {
  Group,
  GroupWithDetails,
  CreateGroupInput,
  UpdateGroupInput,
  User,
  GroupMember,
} from 'src/types/schema'

/**
 * Groups API with Supabase
 * Handles group operations for offline participants
 * NOTE: Groups now use junction table (group_members) for many-to-many relationship
 */
export class GroupsAPI extends BaseAPI {
  /**
   * Create new group
   * Groups are for member organization only - ideation content goes to ideations table
   * Creator is automatically added as first member via group_members table
   */
  async createGroup(
    creatorId: string,
    data: CreateGroupInput
  ): Promise<Group> {
    try {
      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: data.name,
          creator_id: creatorId,
        })
        .select()
        .single()

      if (groupError) {
        throw groupError
      }

      if (!groupData) {
        throw new Error('Failed to create group')
      }

      // Add creator as first member via junction table
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          participant_id: creatorId,
        })

      if (memberError) {
        // Rollback: delete the group
        await supabase.from('groups').delete().eq('id', groupData.id)
        throw memberError
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
   * Fetches group members via junction table
   */
  async getGroupWithDetails(groupId: string): Promise<GroupWithDetails> {
    try {
      // Fetch group with creator
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

      // Fetch group members via junction table
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)

      if (membersError) {
        throw membersError
      }

      // Fetch participant details for all members
      const participantIds = (membersData || []).map((m) => m.participant_id)

      let participantsData: User[] = []
      if (participantIds.length > 0) {
        const { data: participants, error: participantsError } = await supabase
          .from('users')
          .select('*')
          .in('id', participantIds)
          .order('name', { ascending: true })

        if (participantsError) {
          throw participantsError
        }

        participantsData = participants as User[]
      }

      return {
        ...groupData,
        creator: groupData.creator as User,
        members: (membersData || []) as GroupMember[],
        participants: participantsData,
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
   * Adds entry to group_members junction table
   */
  async inviteToGroup(
    groupId: string,
    participantId: string
  ): Promise<Group> {
    try {
      // Get group and check if already submitted
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
        throw new Error(
          'Grup sudah submit ideation dan tidak bisa menerima anggota baru'
        )
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

      if (!participantData.is_checked_in) {
        throw new Error('Participant belum check-in')
      }

      // Check if already member of this group
      const { data: existingMember, error: existingError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('participant_id', participantId)
        .maybeSingle()

      if (existingError) {
        throw existingError
      }

      if (existingMember) {
        throw new Error('Participant sudah ada di grup ini')
      }

      // Add to group via junction table
      const { error: insertError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          participant_id: participantId,
        })

      if (insertError) {
        throw insertError
      }

      // Re-fetch group
      return await this.getGroup(groupId)
    } catch (error) {
      this.handleError(error, 'inviteToGroup')
    }
  }

  /**
   * Remove participant from group
   * Deletes entry from group_members junction table
   * Cannot leave if group has already submitted
   */
  async leaveGroup(groupId: string, participantId: string): Promise<Group> {
    try {
      // Get group and check if already submitted
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
        throw new Error('Grup sudah submit ideation dan tidak bisa meninggalkan grup')
      }

      // Remove from group via junction table
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('participant_id', participantId)

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
   * Get available participants (offline, checked in only)
   * No filtering by group membership for performance (validation done at submission)
   */
  async getAvailableParticipants(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'participant')
        .eq('participant_type', 'offline')
        .eq('is_checked_in', true)
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      return (data || []) as User[]
    } catch (error) {
      this.handleError(error, 'getAvailableParticipants')
    }
  }

  /**
   * Get group members count
   */
  async getGroupMemberCount(groupId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId)

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      this.handleError(error, 'getGroupMemberCount')
    }
  }

  /**
   * Get all groups for a participant (via junction table)
   */
  async getParticipantGroups(participantId: string): Promise<Group[]> {
    try {
      // Get group IDs from junction table
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('participant_id', participantId)

      if (memberError) {
        throw memberError
      }

      if (!memberData || memberData.length === 0) {
        return []
      }

      const groupIds = memberData.map((m) => m.group_id)

      // Fetch group details
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false })

      if (groupsError) {
        throw groupsError
      }

      return (groupsData || []) as Group[]
    } catch (error) {
      this.handleError(error, 'getParticipantGroups')
    }
  }
}
