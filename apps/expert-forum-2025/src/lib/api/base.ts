import type { Models } from 'appwrite'

/**
 * Base API class with common database operations
 */
export abstract class BaseAPI {
  /**
   * Generic error handler
   */
  protected handleError(error: unknown, context?: string): never {
    console.error(`API Error${context ? ` [${context}]` : ''}:`, error)

    if (error instanceof Error) {
      throw error
    }

    throw new Error('An unexpected error occurred')
  }

  /**
   * Transform Appwrite row to typed object
   */
  protected transformDocument<T>(row: Models.DefaultRow): T {
    return row as unknown as T
  }

  /**
   * Transform multiple Appwrite rows to typed array
   */
  protected transformDocuments<T>(rows: Models.DefaultRow[]): T[] {
    return rows.map((row) => this.transformDocument<T>(row))
  }
}
