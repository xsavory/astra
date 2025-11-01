// Email Lists for Authentication
export const ADMIN_EMAILS = [
  'admin1@expert-forum.com',
  'admin2@expert-forum.com',
  'dnmiloen@gmail.com',
] as const

export const STAFF_EMAILS = [
  'staff1@expert-forum.com',
  'staff2@expert-forum.com',
] as const

// Booth Completion Thresholds
export const BOOTH_THRESHOLD = {
  offline: 10,
  online: 6,
} as const

// Pagination Options
export const PAGINATION_SIZES = [10, 25, 50, 100] as const

// Astra Company Options for Ideation
export const COMPANY_OPTIONS = [
  'Astra Otoparts',
  'Astra Agro Lestari',
  'Astra Financial',
  'United Tractors',
  'Astra Honda Motor',
  'Astra Daihatsu Motor',
  'Astra International',
  'Serasi Autoraya',
  'Astra Graphia',
  'Astra Infra',
] as const

// Booth Visual Images Mapping
// Maps booth ID to visual image path from /public folder
// Set to null for booths without images yet - will show placeholder
export const BOOTH_VISUAL_IMAGES: Record<string, string | null> = {
  'booth-001': null,
  'booth-002': null,
  'booth-003': null,
  'booth-004': null,
  'booth-005': null,
} as const

// Check-in Methods
export const CHECKIN_METHODS = {
  QR: 'qr',
  MANUAL: 'manual',
} as const

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  PARTICIPANT: 'participant',
} as const

// Participant Types
export const PARTICIPANT_TYPES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const

// Group Validation
export const MIN_GROUP_SIZE = 2 // Changed from 5 to 2 as per new requirements
export const MAX_GROUP_SIZE = 2 // Exactly 2 members required for offline groups

// Draw Configuration
export const DRAW_CONFIG = {
  MIN_WINNERS: 1,
  MAX_WINNERS: 10,
} as const


// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy, HH:mm',
  DISPLAY_SHORT: 'dd/MM/yyyy',
  TIME_ONLY: 'HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const

// Helper function to check if email is admin
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email as typeof ADMIN_EMAILS[number])
}

// Helper function to check if email is staff
export const isStaffEmail = (email: string): boolean => {
  return STAFF_EMAILS.includes(email as typeof STAFF_EMAILS[number])
}

// Helper function to determine if email requires OTP login
export const requiresOTPLogin = (email: string): boolean => {
  return isAdminEmail(email)
}

// Helper function to determine if email needs password input
export const requiresPasswordInput = (email: string): boolean => {
  return isStaffEmail(email) || (!isAdminEmail(email) && !isStaffEmail(email))
}

// Helper function to get user role from email
export const getRoleFromEmail = (email: string): 'admin' | 'staff' | 'participant' => {
  if (isAdminEmail(email)) return USER_ROLES.ADMIN as 'admin'
  if (isStaffEmail(email)) return USER_ROLES.STAFF as 'staff'
  return USER_ROLES.PARTICIPANT as 'participant'
}
