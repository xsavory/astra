import { BOOTH_VISUAL_IMAGES } from './constants'

interface CapitaliseOptions {
  start: number;
  end: number;
}

/**
 * Capitalises the characters of a provided string between the given start and end indexes
 */
export function capitalise(value: string, options?: Partial<CapitaliseOptions>): string {
  const { length } = value;

  let { start, end }: CapitaliseOptions = { start: 0, end: length, ...options };

  if (start < 0) {
    start = 0;
  }

  if (end > length) {
    end = length;
  }

  const stringStart = value.substring(0, start);
  const capitalise = value.substring(start, end);
  const stringEnd = value.substring(end, length);

  return `${stringStart}${capitalise.toUpperCase()}${stringEnd}`;
}

/**
 * Gets the visual image path for a booth by its ID
 * Returns null if booth ID not found or no image set yet
 * @param boothId - The booth ID to lookup
 * @returns The image path from /public folder or null
 */
export function getBoothVisualImage(boothId: string): string | null {
  return BOOTH_VISUAL_IMAGES[boothId] ?? null
}

/**
 * Password Generator Utility
 *
 * Generates passwords with format: {firstName}-{XXXX}
 * where XXXX is 4 random uppercase letters (A-Z)
 *
 * Example: "John Doe" → "John-ABCD"
 */

/**
 * Generate random uppercase letters
 */
export function generateRandomUppercase(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Extract first name from full name
 */
export function extractFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || 'User'
}

/**
 * Generate password with format: {firstName}-{XXXX}
 *
 * @param fullName - Full name of the user
 * @returns Generated password
 *
 * @example
 * generatePassword("John Doe") // Returns "John-ABCD" (random letters)
 * generatePassword("Maria") // Returns "Maria-XYZW" (random letters)
 */
export function generatePassword(fullName: string): string {
  const firstName = extractFirstName(fullName).toLowerCase()
  const randomChars = generateRandomUppercase(4)
  return `${firstName}-${randomChars}`
}
