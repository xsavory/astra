import { tablesDB, ID, Query, DATABASE_ID, TABLES } from './client'
import { BaseAPI } from './base'
import type { Group, GroupWithDetails, CreateGroupInput, UpdateGroupInput, User } from 'src/types/schema'
import { MIN_GROUP_SIZE } from 'src/lib/constants'

/**
 * Groups API
 * Handles group operations for offline participants
 */
export class GroupsAPI extends BaseAPI {
  /**
   * Create new group
   */
  async createGroup(creatorId: string, data: CreateGroupInput): Promise<Group> {
    try {
      // Validate creator is offline participant
      const creatorDoc = await tablesDB.getRow(
        DATABASE_ID,
        TABLES.USERS,
        creatorId
      )
      const creator = this.transformDocument<User>(creatorDoc)

      if (creator.participantType !== 'offline') {
        throw new Error('Hanya offline participant yang bisa membuat grup')
      }

      if (creator.groupId) {
        throw new Error('Participant sudah ada di grup lain')
      }

      // Create group
      const groupDoc = await tablesDB.createRow(
        DATABASE_ID,
        TABLES.GROUPS,
        ID.unique(),
        {
          title: data.title,
          description: data.description,
          companyCase: data.companyCase,
          creatorId,
          participantIds: [creatorId], // Auto-add creator
          isSubmitted: false,
          createdAt: new Date().toISOString(),
        }
      )

      const group = this.transformDocument<Group>(groupDoc)

      // Update creator's groupId
      await tablesDB.updateRow(DATABASE_ID, TABLES.USERS, creatorId, {
        groupId: group.$id,
      })

      return group
    } catch (error) {
      this.handleError(error, 'createGroup')
    }
  }

  /**
   * Get group by ID
   */
  async getGroup(groupId: string): Promise<Group> {
    try {
      const groupDoc = await tablesDB.getRow(
        DATABASE_ID,
        TABLES.GROUPS,
        groupId
      )

      return this.transformDocument<Group>(groupDoc)
    } catch (error) {
      this.handleError(error, 'getGroup')
    }
  }

  /**
   * Get group with participant details
   */
  async getGroupWithDetails(groupId: string): Promise<GroupWithDetails> {
    try {
      const group = await this.getGroup(groupId)

      // Fetch creator
      const creatorDoc = await tablesDB.getRow(
        DATABASE_ID,
        TABLES.USERS,
        group.creatorId
      )

      // Fetch all participants
      const participants = await Promise.all(
        group.participantIds.map(async id => {
          const doc = await tablesDB.getRow(DATABASE_ID, TABLES.USERS, id)
          return this.transformDocument<User>(doc)
        })
      )

      return {
        ...group,
        creator: this.transformDocument<User>(creatorDoc),
        participants,
      }
    } catch (error) {
      this.handleError(error, 'getGroupWithDetails')
    }
  }

  /**
   * Update group details
   */
  async updateGroup(groupId: string, data: UpdateGroupInput): Promise<Group> {
    try {
      const group = await this.getGroup(groupId)

      if (group.isSubmitted) {
        throw new Error('Grup sudah di-submit, tidak bisa diubah')
      }

      const groupDoc = await tablesDB.updateRow(
        DATABASE_ID,
        TABLES.GROUPS,
        groupId,
        data
      )

      return this.transformDocument<Group>(groupDoc)
    } catch (error) {
      this.handleError(error, 'updateGroup')
    }
  }

  /**
   * Invite participant to group
   */
  async inviteToGroup(groupId: string, participantId: string): Promise<Group> {
    try {
      // Get group
      const group = await this.getGroup(groupId)

      if (group.isSubmitted) {
        throw new Error('Grup sudah di-submit, tidak bisa menambah anggota')
      }

      // Validate participant
      const participantDoc = await tablesDB.getRow(
        DATABASE_ID,
        TABLES.USERS,
        participantId
      )
      const participant = this.transformDocument<User>(participantDoc)

      if (participant.participantType !== 'offline') {
        throw new Error('Hanya offline participant yang bisa join grup')
      }

      if (participant.groupId) {
        throw new Error('Participant sudah ada di grup lain')
      }

      // Check if participant already in this group
      if (group.participantIds.includes(participantId)) {
        throw new Error('Participant sudah ada di grup ini')
      }

      // Update group
      const updatedGroupDoc = await tablesDB.updateRow(
        DATABASE_ID,
        TABLES.GROUPS,
        groupId,
        {
          participantIds: [...group.participantIds, participantId],
        }
      )

      // Update participant's groupId
      await tablesDB.updateRow(DATABASE_ID, TABLES.USERS, participantId, {
        groupId,
      })

      return this.transformDocument<Group>(updatedGroupDoc)
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

      if (group.isSubmitted) {
        throw new Error('Grup sudah di-submit, tidak bisa keluar')
      }

      // Update group
      const updatedGroupDoc = await tablesDB.updateRow(
        DATABASE_ID,
        TABLES.GROUPS,
        groupId,
        {
          participantIds: group.participantIds.filter(id => id !== participantId),
        }
      )

      // Clear participant's groupId
      await tablesDB.updateRow(DATABASE_ID, TABLES.USERS, participantId, {
        groupId: null,
      })

      return this.transformDocument<Group>(updatedGroupDoc)
    } catch (error) {
      this.handleError(error, 'leaveGroup')
    }
  }

  /**
   * Submit group (validate minimum size)
   */
  async submitGroup(groupId: string): Promise<Group> {
    try {
      // Re-fetch group to ensure real-time data
      const group = await this.getGroup(groupId)

      if (group.isSubmitted) {
        throw new Error('Grup sudah di-submit')
      }

      // Validate minimum group size
      if (group.participantIds.length < MIN_GROUP_SIZE) {
        throw new Error(`Grup minimal ${MIN_GROUP_SIZE} anggota`)
      }

      // Update group
      const updatedGroupDoc = await tablesDB.updateRow(
        DATABASE_ID,
        TABLES.GROUPS,
        groupId,
        {
          isSubmitted: true,
          submittedAt: new Date().toISOString(),
        }
      )

      return this.transformDocument<Group>(updatedGroupDoc)
    } catch (error) {
      this.handleError(error, 'submitGroup')
    }
  }

  /**
   * Get available participants (offline, not in any group)
   */
  async getAvailableParticipants(): Promise<User[]> {
    try {
      const response = await tablesDB.listRows(
        DATABASE_ID,
        TABLES.USERS,
        [
          Query.equal('participantType', 'offline'),
          Query.isNull('groupId'),
          Query.equal('role', 'participant'),
        ]
      )

      return this.transformDocuments<User>(response.rows)
    } catch (error) {
      this.handleError(error, 'getAvailableParticipants')
    }
  }
}
