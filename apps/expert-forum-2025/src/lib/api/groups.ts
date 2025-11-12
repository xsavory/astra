import { supabase } from './client'
import { BaseAPI } from './base'
import type {
  Group,
  GroupWithDetails,
  CreateGroupInput,
  UpdateGroupInput,
  User,
  GroupMember,
  Ideation,
} from 'src/types/schema'

/**
 * Groups API with Supabase
 * Handles group operations for offline participants
 * NOTE: Groups now use junction table (group_members) for many-to-many relationship
 */
export class GroupsAPI extends BaseAPI {
  /**
   * Create new group with members
   * Groups are for member organization only - ideation content goes to ideations table
   * Creator is automatically added as first member via group_members table
   * Additional members can be added during creation (validated)
   *
   * Business Rules (from inviteToGroup validation):
   * - Only offline participants can be members
   * - Participants must be checked in
   * - No duplicate members allowed
   * - Creator is automatically included (don't pass in member_ids)
   */
  async createGroup(
    creatorId: string,
    data: CreateGroupInput
  ): Promise<Group> {
    try {
      // Validate creator
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

      if (creatorData.participant_type !== 'offline') {
        throw new Error('Hanya offline participant yang bisa membuat grup')
      }

      if (!creatorData.is_checked_in) {
        throw new Error('Creator belum check-in')
      }

      // Validate additional members if provided
      const memberIds = data.member_ids || []
      const validatedMemberIds: string[] = []

      if (memberIds.length > 0) {
        // Remove duplicates and exclude creator
        const uniqueMemberIds = Array.from(
          new Set(memberIds.filter((id) => id !== creatorId))
        )

        if (uniqueMemberIds.length > 0) {
          // Fetch all members at once
          const { data: membersData, error: membersError } = await supabase
            .from('users')
            .select('*')
            .in('id', uniqueMemberIds)

          if (membersError) {
            throw membersError
          }

          if (!membersData || membersData.length !== uniqueMemberIds.length) {
            throw new Error('Beberapa participant tidak ditemukan')
          }

          // Validate each member
          for (const member of membersData) {
            if (member.participant_type !== 'offline') {
              throw new Error(
                `${member.name}: Hanya offline participant yang bisa join grup`
              )
            }

            if (!member.is_checked_in) {
              throw new Error(`${member.name}: Participant belum check-in`)
            }

            // Validate company - tidak boleh dari company yang sama dengan creator
            if (member.company && creatorData.company &&
                member.company.toLowerCase() === creatorData.company.toLowerCase()) {
              throw new Error(
                `${member.name}: Tidak boleh membuat grup dengan anggota dari company yang sama`
              )
            }

            validatedMemberIds.push(member.id)
          }
        }
      }

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

      // Prepare all members to insert (creator + validated members)
      const allMemberIds = [creatorId, ...validatedMemberIds]
      const memberInserts = allMemberIds.map((participantId) => ({
        group_id: groupData.id,
        participant_id: participantId,
      }))

      // Add all members via junction table in one insert
      const { error: membersError } = await supabase
        .from('group_members')
        .insert(memberInserts)

      if (membersError) {
        // Rollback: delete the group
        await supabase.from('groups').delete().eq('id', groupData.id)
        throw membersError
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
   * Get group with participant details and ideation
   * Optimized with JOIN query to fetch all related data in minimal queries
   */
  async getGroupWithDetails(groupId: string): Promise<GroupWithDetails> {
    try {
      // Fetch group with creator and ideation in single query
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

      // Fetch ideation if group has submitted
      let ideationData: Ideation | null = null
      if (groupData.is_submitted) {
        const { data: ideation, error: ideationError } = await supabase
          .from('ideations')
          .select('*')
          .eq('group_id', groupId)
          .maybeSingle()

        if (ideationError) {
          throw ideationError
        }

        ideationData = ideation as Ideation | null
      }

      return {
        ...groupData,
        creator: groupData.creator as User,
        members: (membersData || []) as GroupMember[],
        participants: participantsData,
        ideation: ideationData,
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
   * Business Rules:
   * - Creator CANNOT leave their own group
   * - Non-creator members can only leave if group has NOT submitted
   */
  async leaveGroup(groupId: string, participantId: string): Promise<Group> {
    try {
      // Get group data
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

      // Check if participant is creator
      if (groupData.creator_id === participantId) {
        throw new Error(
          'Creator tidak bisa meninggalkan grup yang dibuat sendiri'
        )
      }

      // Check if group has already submitted
      if (groupData.is_submitted) {
        throw new Error(
          'Grup sudah submit ideation dan tidak bisa meninggalkan grup'
        )
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
   * @param searchQuery - Optional search query to filter by name, email, or company
   * @param excludeCompany - Optional company name to exclude participants from the same company
   */
  async getAvailableParticipants(
    searchQuery?: string,
    excludeCompany?: string
  ): Promise<User[]> {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'participant')
        .eq('participant_type', 'offline')
        .eq('is_checked_in', true)

      // Exclude participants from the same company
      if (excludeCompany && excludeCompany.trim().length > 0) {
        query = query.neq('company', excludeCompany.trim())
      }

      // Add search filters if query provided
      if (searchQuery && searchQuery.trim().length > 0) {
        const search = `%${searchQuery.trim()}%`
        query = query.or(
          `name.ilike.${search},email.ilike.${search},company.ilike.${search}`
        )
      }

      const { data, error } = await query.order('name', { ascending: true })

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
