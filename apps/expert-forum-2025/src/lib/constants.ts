import type { PrizeTemplate } from 'src/types/schema'

import boothMock1 from 'src/assets/booth-mock-1.png'
import boothMock2 from 'src/assets/booth-mock-2.png'
import boothMock3 from 'src/assets/booth-mock-3.png'

// Email Lists for Authentication
export const ADMIN_EMAILS = [
  'dnmiloen@gmail.com',
  'hafrinugraha@gmail.com',
  'herrywitoko@absoluteeo.com',
  'indy@absoluteeo.com',
  'adi@absoluteeo.com'
] as const

export const STAFF_EMAILS = [
  'staff1@expert-forum.com',
  'staff2@expert-forum.com',
  'staff3@expert-forum.com',
  'staff4@expert-forum.com',
  'staff5@expert-forum.com',
  'staff6@expert-forum.com',
  'staff7@expert-forum.com',
  'staff8@expert-forum.com',
  'staff9@expert-forum.com',
  'staff10@expert-forum.com',
  'staff11@expert-forum.com',
  'staff12@expert-forum.com',
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
  "PT AT Indonesia",
  "PT Aisin Indonesia",
  "PT Akebono Brake Astra Indonesia",
  "PT Astra Agro Lestari Tbk",
  "PT Astra Daihatsu Motor",
  "PT Astra Graphia Information Technology",
  "PT Astra Graphia Tbk",
  "PT Astra Honda Motor",
  "PT Astra International Tbk",
  "PT Astra Juoku Indonesia",
  "PT Astra Komponen Indonesia",
  "PT Astra Otoparts Tbk",
  "PT Astra Otoparts Tbk - Divisi Winteq",
  "PT Astra Otoparts Tbk - EDC",
  "PT Astra Otoparts Tbk - HO",
  "PT Astra Otoparts Tbk - Nusametal",
  "PT Astra Otoparts Tbk - WINTEQ",
  "PT Astra Visteon Indonesia",
  "PT Astra Visteon Vietnam",
  "PT Asuransi Astra Buana",
  "PT Autoplastik Indonesia",
  "PT Century Batteries Indonesia",
  "PT Denso Indonesia",
  "PT Federal Nittan Industries",
  "PT Fuji Technica Indonesia",
  "PT GS Battery",
  "PT Gaya Motor",
  "PT Gemala Kempa Daya",
  "PT Inti Ganda Perdana",
  "PT Isuzu Astra Motor Indonesia",
  "PT Kayaba Indonesia",
  "PT Komatsu Remanufacturing Asia",
  "PT Menara Terus Makmur",
  "PT Pamapersada Nusantara",
  "PT Patria Maritime Perkasa",
  "PT SKF Indonesia",
  "PT Triatra Sinergia Pratama",
  "PT Tuah Turangga Agung",
  "PT United Tractors Pandu Engineering",
  "PT United Tractors Tbk",
  "PT Velasto Indonesia",
  "Politeknik Astra"
] as const

// Booth Visual Images Mapping
// Maps booth ID to visual image path from /public folder
// Set to null for booths without images yet - will show placeholder
export const BOOTH_VISUAL_IMAGES: Record<string, string | null> = {
  'a43092af-dfc2-40ff-85a2-6af8397d294f': boothMock1,
  'f4c7a4e2-9513-42cb-94c0-3946e3ccffcd': boothMock2,
  'c8d80f15-743c-4ca0-8bc2-ae25dae8bb6a': boothMock3,
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

export const PRIZE_TEMPLATES: PrizeTemplate[] = [
  {
    id: 'motor-5',
    name: 'Motor',
    slotCount: 5,
    description: '5 Pemenang Motor',
    icon: 'Bike',
  },
  {
    id: 'handphone-10',
    name: 'Handphone',
    slotCount: 10,
    description: '10 Pemenang Handphone',
    icon: 'Smartphone',
  },
  {
    id: 'mobil-1',
    name: 'Mobil',
    slotCount: 1,
    description: '1 Pemenang Mobil',
    icon: 'Car',
  },
  {
    id: 'voucher-3',
    name: 'Voucher',
    slotCount: 3,
    description: '3 Pemenang Voucher',
    icon: 'Gift',
  },
]

export const DEFAULT_TEMPLATE = PRIZE_TEMPLATES[0]!

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
