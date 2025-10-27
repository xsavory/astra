import { tablesDB, ID, Query, DATABASE_ID, TABLES } from './client'
import { BaseAPI } from './base'
import type { Ideation, IdeationWithDetails, CreateIdeationInput, User } from 'src/types/schema'
import { MIN_GROUP_SIZE } from 'src/lib/constants'

/**
 * Ideations API
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
      const creatorDoc = await tablesDB.getRow(
        DATABASE_ID,
        TABLES.USERS,
        creatorId
      )
      const creator = this.transformDocument<User>(creatorDoc)

      if (creator.participantType !== 'online') {
        throw new Error('Hanya online participant yang bisa submit ideation individual')
      }

      // Check if already submitted
      const existingIdeations = await tablesDB.listRows(
        DATABASE_ID,
        TABLES.IDEATIONS,
        [Query.equal('creatorId', creatorId), Query.limit(1)]
      )

      if (existingIdeations.rows.length > 0) {
        throw new Error('Participant sudah submit ideation')
      }

      // Create ideation
      const ideationDoc = await tablesDB.createRow(
        DATABASE_ID,
        TABLES.IDEATIONS,
        ID.unique(),
        {
          title: data.title,
          description: data.description,
          companyCase: data.companyCase,
          creatorId,
          participantIds: [creatorId],
          isGroup: false,
          isSubmitted: true,
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
      )

      return this.transformDocument<Ideation>(ideationDoc)
    } catch (error) {
      this.handleError(error, 'createIndividualIdeation')
    }
  }

  /**
   * Create group ideation from existing group
   */
  async createGroupIdeation(groupId: string): Promise<Ideation> {
    try {
      // Get group
      const groupDoc = await tablesDB.getRow(
        DATABASE_ID,
        TABLES.GROUPS,
        groupId
      )
      const group = this.transformDocument<any>(groupDoc)

      if (!group.isSubmitted) {
        throw new Error('Grup belum di-submit')
      }

      // Check if group already has ideation
      const existingIdeations = await tablesDB.listRows(
        DATABASE_ID,
        TABLES.IDEATIONS,
        [Query.equal('creatorId', group.creatorId), Query.equal('isGroup', true), Query.limit(1)]
      )

      if (existingIdeations.rows.length > 0) {
        throw new Error('Grup sudah memiliki ideation')
      }

      // Validate minimum group size
      if (group.participantIds.length < MIN_GROUP_SIZE) {
        throw new Error(`Grup minimal ${MIN_GROUP_SIZE} anggota`)
      }

      // Create ideation from group data
      const ideationDoc = await tablesDB.createRow(
        DATABASE_ID,
        TABLES.IDEATIONS,
        ID.unique(),
        {
          title: group.title,
          description: group.description,
          companyCase: group.companyCase,
          creatorId: group.creatorId,
          participantIds: group.participantIds,
          isGroup: true,
          isSubmitted: true,
          submittedAt: group.submittedAt,
          createdAt: new Date().toISOString(),
        }
      )

      return this.transformDocument<Ideation>(ideationDoc)
    } catch (error) {
      this.handleError(error, 'createGroupIdeation')
    }
  }

  /**
   * Get all submitted ideations
   */
  async getIdeations(): Promise<Ideation[]> {
    try {
      const response = await tablesDB.listRows(
        DATABASE_ID,
        TABLES.IDEATIONS,
        [Query.equal('isSubmitted', true), Query.orderDesc('submittedAt')]
      )

      return this.transformDocuments<Ideation>(response.rows)
    } catch (error) {
      this.handleError(error, 'getIdeations')
    }
  }

  /**
   * Get ideation by ID
   */
  async getIdeation(ideationId: string): Promise<Ideation> {
    try {
      const ideationDoc = await tablesDB.getRow(
        DATABASE_ID,
        TABLES.IDEATIONS,
        ideationId
      )

      return this.transformDocument<Ideation>(ideationDoc)
    } catch (error) {
      this.handleError(error, 'getIdeation')
    }
  }

  /**
   * Get ideation with participant details
   */
  async getIdeationWithDetails(ideationId: string): Promise<IdeationWithDetails> {
    try {
      const ideation = await this.getIdeation(ideationId)

      // Fetch creator
      const creatorDoc = await tablesDB.getRow(
        DATABASE_ID,
        TABLES.USERS,
        ideation.creatorId
      )

      // Fetch all participants (for group ideations)
      let participants: User[] = []
      if (ideation.isGroup && ideation.participantIds.length > 0) {
        participants = await Promise.all(
          ideation.participantIds.map(async id => {
            const doc = await tablesDB.getRow(DATABASE_ID, TABLES.USERS, id)
            return this.transformDocument<User>(doc)
          })
        )
      }

      return {
        ...ideation,
        creator: this.transformDocument<User>(creatorDoc),
        participants,
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
      const response = await tablesDB.listRows(
        DATABASE_ID,
        TABLES.IDEATIONS,
        [Query.equal('creatorId', creatorId), Query.limit(1)]
      )

      if (response.rows.length === 0) {
        return null
      }

      return this.transformDocument<Ideation>(response.rows[0]!)
    } catch (error) {
      this.handleError(error, 'getIdeationByCreator')
    }
  }
}
