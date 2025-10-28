import { PostgrestError } from '@supabase/supabase-js'

/**
 * Base API class with common database operations for Supabase
 */
export abstract class BaseAPI {
  /**
   * Generic error handler for Supabase errors
   */
  protected handleError(error: unknown, context?: string): never {
    console.error(`API Error${context ? ` [${context}]` : ''}:`, error)

    // Handle Supabase Postgrest errors
    if (this.isPostgrestError(error)) {
      const postgrestError = error as PostgrestError
      throw new Error(
        `${postgrestError.message} (Code: ${postgrestError.code}${postgrestError.details ? `, Details: ${postgrestError.details}` : ''})`
      )
    }

    // Handle standard errors
    if (error instanceof Error) {
      throw error
    }

    // Fallback for unknown errors
    throw new Error('An unexpected error occurred')
  }

  /**
   * Type guard to check if error is a Postgrest error
   */
  protected isPostgrestError(error: unknown): error is PostgrestError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'code' in error
    )
  }

  /**
   * Helper to throw error if data is null (common pattern in Supabase)
   */
  protected ensureData<T>(
    data: T | null,
    errorMessage: string = 'Data not found'
  ): T {
    if (data === null) {
      throw new Error(errorMessage)
    }
    return data
  }

  /**
   * Helper to validate required fields
   */
  protected validateRequired<T>(
    data: T,
    requiredFields: (keyof T)[]
  ): void {
    const missingFields = requiredFields.filter(
      (field) => data[field] === undefined || data[field] === null
    )

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields: ${missingFields.join(', ')}`
      )
    }
  }
}
