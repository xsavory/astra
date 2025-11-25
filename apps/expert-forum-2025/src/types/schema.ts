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
  is_votes_open: boolean // Controls when participants can vote
  is_votes_lock: boolean // Locks voting permanently after finalization
  zoom_meeting_url?: string
  event_dates?: string | null // Scheduled date and time for the event
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
  last_sign_in_at?: string | null // From auth.users via view
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

// Multiple-choice question structure
export interface BoothQuestion {
  question: string
  options: [string, string, string, string] // Exactly 4 options (A, B, C, D)
  correct_answer: number // Index of correct answer (0-3)
}

export interface Booth {
  id: string
  name: string
  description?: string | null
  poster_url?: string | null
  questions: BoothQuestion[] // Array of multiple-choice questions (stored as JSONB in database)
  order: number
  created_at: string
  updated_at: string
}

// ==================== Booth Check-in Types ====================

export interface BoothCheckin {
  id: string
  participant_id: string
  booth_id: string
  points: number // Points earned (10-100) based on attempts
  attempts: number // Number of attempts before correct answer
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
  points: number // Points earned (calculated client-side)
  attempts: number // Total attempts before correct answer
}

// ==================== Booth Voting Types ====================

export interface BoothVote {
  id: string
  participant_id: string
  booth_id: string
  voted_at: string
}

// Booth Vote with populated booth data
export interface BoothVoteWithBooth extends BoothVote {
  booth?: Booth
}

// Create Booth Vote Input
export interface CreateBoothVoteInput {
  booth_id: string
}

// Submit Multiple Votes Input (exactly 2 booths)
export interface SubmitBoothVotesInput {
  booth_ids: [string, string] // Exactly 2 booth IDs
}

// Booth with vote statistics
export interface BoothWithVoteStats extends Booth {
  vote_count: number
  vote_percentage: number
  rank: number
}

// ==================== Booth Vote Results Types ====================
// Final voting results snapshot (immutable after submission)

export interface BoothVoteResult {
  id: string
  event_id: string
  booth_id: string
  final_vote_count: number
  final_rank: number
  submitted_at: string
  submitted_by: string | null
}

// Booth Vote Result with populated data
export interface BoothVoteResultWithDetails extends BoothVoteResult {
  booth?: Booth
  event?: Event
  staff?: User
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
  ideation?: Ideation | null // Group's submitted ideation (if any)
}

// Create/Update Group Input
export interface CreateGroupInput {
  name: string
  member_ids?: string[] // Optional: IDs of participants to add as members (excluding creator)
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
  is_winner: boolean
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

export type PrizeCategory = 'grand' | 'major' | 'minor'

// Prize Template
export interface PrizeTemplate {
  id: string
  name: string
  slotCount: number
  description: string
  icon: string
  participantType: ParticipantType // 'online' | 'offline'
  category: PrizeCategory // 'grand' | 'major' | 'minor'
  prizeId: string // Unique prize identifier (e.g., "ipad_11_2025")
}

// Individual Prize Info (for online multi-prize draws)
export interface PrizeInfo {
  prizeId: string
  prizeName: string
  category: PrizeCategory
}

// Draw Slot for tracking individual slot state
export interface DrawSlot {
  slotNumber: number
  selectedWinnerId: string | null
  animatingParticipantId: string | null
  isRevealed: boolean
  prizeInfo?: PrizeInfo // Prize info for this specific slot (used in online draws)
}

// Cached Draw Session for localStorage
export interface CachedDrawSession {
  id: string
  templateId: string
  templateName: string
  slotCount: number
  participantType: ParticipantType // 'online' | 'offline'
  prizeCategory: PrizeCategory // 'grand' | 'major' | 'minor'
  winners: Array<{
    slotNumber: number
    participant: User
    prizeInfo?: PrizeInfo // Prize info for this winner (used in online draws)
  }>
  createdAt: string
  status: 'pending' | 'submitted'
}

export interface DrawLog {
  id: string
  staff_id?: string | null // Staff who created the draw
  prize_template?: string | null // Template ID (e.g., "motor-5")
  prize_name?: string | null // Prize display name (e.g., "Motor")
  slot_count?: number | null // Number of winners in this session
  participant_type?: ParticipantType | null // Type of participant (online/offline)
  prize_category?: string | null // Category of prize (grand/major/minor)
  created_at: string
}

// Draw Winner (join table)
export interface DrawWinner {
  id: string
  draw_log_id: string
  participant_id: string
  prize_name?: string | null // Specific prize this winner received
  created_at: string
}

// Winner with User details and prize info
export interface WinnerWithDetails extends User {
  prize_name?: string | null // Prize name from draw_winners table
}

// Draw Log with populated winners
export interface DrawLogWithDetails extends DrawLog {
  winners?: WinnerWithDetails[]
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

// Sign-in statistics (excluding test users)
export interface SignInStats {
  total: number
  offline: number
  online: number
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
