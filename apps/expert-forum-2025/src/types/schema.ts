// ==================== Enums & Literal Types ====================

export type UserRole = 'admin' | 'staff' | 'participant'
export type ParticipantType = 'online' | 'offline'
export type CheckinMethod = 'qr' | 'manual'

// ==================== Event Types ====================

export interface Event {
  id: string
  name: string
  date: string
  is_active: boolean
  zoom_meeting_url?: string
  created_at: string
  updated_at: string
}

// ==================== User Types ====================

export interface User {
  id: string
  auth_id?: string
  name: string
  email: string
  role: UserRole
  participant_type?: ParticipantType
  company?: string | null
  division?: string | null
  is_checked_in?: boolean
  is_eligible_to_draw?: boolean
  event_checkin_time?: string | null
  event_checkin_method?: CheckinMethod | null
  checked_in_by?: string | null // Staff ID who checked in the participant
  created_at: string
  updated_at: string
}

// Note: group_id removed - participants can be in multiple groups via group_members table

// Create/Update User Input Types
export interface CreateUserInput {
  name: string
  email: string
  participant_type: ParticipantType
  company?: string
  division?: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  participant_type?: ParticipantType
  company?: string
  division?: string
}

// ==================== Booth Types ====================

export interface Booth {
  id: string
  name: string
  description?: string | null
  poster_url?: string | null
  questions: string[] // Array of question strings (stored as JSONB in database)
  order: number
  created_at: string
  updated_at: string
}

// ==================== Booth Check-in Types ====================

export interface BoothCheckin {
  id: string
  participant_id: string
  booth_id: string
  answer?: string | null
  checkin_time: string
}

// Booth Check-in with populated data
export interface BoothCheckinWithDetails extends BoothCheckin {
  booth?: Booth
  participant?: User
}

// Create Booth Check-in Input
export interface CreateBoothCheckinInput {
  booth_id: string
  answer: string
}

// ==================== Group Types ====================

export interface Group {
  id: string
  name: string
  creator_id: string
  is_submitted: boolean
  submitted_at?: string | null
  created_at: string
  updated_at: string
}

// Group member (junction table entry)
export interface GroupMember {
  id: string
  group_id: string
  participant_id: string
  joined_at: string
}

// Group with populated participants (via group_members junction table)
export interface GroupWithDetails extends Group {
  creator?: User
  members?: GroupMember[] // Junction table entries
  participants?: User[] // Populated participant data
}

// Create/Update Group Input
export interface CreateGroupInput {
  name: string
}

export interface UpdateGroupInput {
  name?: string
}

// Group validation input for ideation submission
export interface ValidateGroupSubmissionInput {
  group_id: string
  company_case: string
}

// ==================== Ideation Types ====================

export interface Ideation {
  id: string
  title: string
  description: string
  company_case: string
  creator_id: string
  group_id?: string | null
  is_group: boolean
  submitted_at?: string | null
  created_at: string
  updated_at: string
}

// Ideation with populated data
export interface IdeationWithDetails extends Ideation {
  creator?: User
  group?: GroupWithDetails
  participants?: User[]
}

// Create Ideation Input
export interface CreateIdeationInput {
  title: string
  description: string
  company_case: string
}

// ==================== Draw Log Types ====================

export interface DrawLog {
  id: string
  staff_id?: string | null // Staff who created the draw
  created_at: string
}

// Draw Winner (join table)
export interface DrawWinner {
  id: string
  draw_log_id: string
  participant_id: string
  created_at: string
}

// Draw Log with populated winners
export interface DrawLogWithDetails extends DrawLog {
  winners?: User[]
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
  total_pages: number
}

// ==================== Query Filters Types ====================

export interface UserFilters {
  participant_type?: ParticipantType
  is_checked_in?: boolean
  is_eligible_to_draw?: boolean
  company?: string
  search?: string // Searches name and email
}

// ==================== Authentication Types ====================

export interface LoginInput {
  email: string
  password?: string // Optional because participants don't need password input
}

export interface AuthSession {
  user_id: string
  session_id: string
  user: User
}

// ==================== User Detail Types (for drawer/detail view) ====================

export interface UserDetail {
  user: User
  booth_checkins: BoothCheckinWithDetails[]
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
