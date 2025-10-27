// ==================== Enums & Literal Types ====================

export type UserRole = 'admin' | 'staff' | 'participant'
export type ParticipantType = 'online' | 'offline'
export type CheckinMethod = 'qr' | 'manual'

// ==================== Event Types ====================

export interface Event {
  $id: string
  name: string
  date: string
  isActive: boolean
  zoomMeetingUrl?: string
  createdAt: string
  updatedAt: string
}

// ==================== User Types ====================

export interface User {
  $id: string
  name: string
  email: string
  role: UserRole
  participantType?: ParticipantType
  company?: string | null
  division?: string | null
  isCheckedIn?: boolean
  isEligibleToDraw?: boolean
  eventCheckinTime?: string | null
  eventCheckinMethod?: CheckinMethod | null
  checkedInBy?: string | null // Staff ID who checked in the participant
  groupId?: string | null
  createdAt: string
  updatedAt: string
}

// Create/Update User Input Types
export interface CreateUserInput {
  name: string
  email: string
  participantType: ParticipantType
  company?: string
  division?: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  participantType?: ParticipantType
  company?: string
  division?: string
}

// ==================== Booth Types ====================

export interface Booth {
  $id: string
  name: string
  description?: string | null
  posterUrl?: string | null
  questionText?: string | null
  order: number
  isOnlineOnly?: boolean
  isOfflineOnly?: boolean
}

// ==================== Booth Check-in Types ====================

export interface BoothCheckin {
  $id: string
  participantId: string
  boothId: string
  answer?: string | null
  checkinTime: string
}

// Booth Check-in with populated data
export interface BoothCheckinWithDetails extends BoothCheckin {
  booth?: Booth
  participant?: User
}

// Create Booth Check-in Input
export interface CreateBoothCheckinInput {
  boothId: string
  answer: string
}

// ==================== Group Types ====================

export interface Group {
  $id: string
  title: string
  description: string
  companyCase: string
  creatorId: string
  participantIds: string[]
  isSubmitted: boolean
  submittedAt?: string | null
  createdAt: string
}

// Group with populated participants
export interface GroupWithDetails extends Group {
  creator?: User
  participants?: User[]
}

// Create/Update Group Input
export interface CreateGroupInput {
  title: string
  description: string
  companyCase: string
}

export interface UpdateGroupInput {
  title?: string
  description?: string
  companyCase?: string
}

// ==================== Ideation Types ====================

export interface Ideation {
  $id: string
  title: string
  description: string
  companyCase: string
  creatorId: string
  participantIds: string[] // For group ideations
  isGroup: boolean
  isSubmitted: boolean
  submittedAt?: string | null
  createdAt: string
}

// Ideation with populated data
export interface IdeationWithDetails extends Ideation {
  creator?: User
  participants?: User[]
}

// Create Ideation Input
export interface CreateIdeationInput {
  title: string
  description: string
  companyCase: string
}

// ==================== Draw Log Types ====================

export interface DrawLog {
  $id: string
  winners: string[] // Array of participant IDs
  staffId?: string | null // Staff who created the draw
  createdAt: string
}

// Draw Log with populated winners
export interface DrawLogWithDetails extends DrawLog {
  winnerDetails?: User[]
  staff?: User
}

// ==================== Stats Types ====================

export interface Stats {
  totalParticipants: {
    total: number
    offline: number
    online: number
  }
  checkedIn: {
    total: number
    offline: number
    online: number
  }
  eligibleForDraw: number
  submissions: {
    total: number
    group: number
    individual: number
  }
}

// ==================== Pagination Types ====================

export interface Pagination {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ==================== Query Filters Types ====================

export interface UserFilters {
  participantType?: ParticipantType
  isCheckedIn?: boolean
  isEligibleToDraw?: boolean
  company?: string
  search?: string // Searches name and email
}

// ==================== Authentication Types ====================

export interface LoginInput {
  email: string
  password?: string // Optional because participants don't need password input
}

export interface AuthSession {
  userId: string
  sessionId: string
  user: User
}

// ==================== User Detail Types (for drawer/detail view) ====================

export interface UserDetail {
  user: User
  boothCheckins: BoothCheckinWithDetails[]
  ideation?: Ideation | null
  group?: GroupWithDetails | null
}

// ==================== API Response Types ====================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}
