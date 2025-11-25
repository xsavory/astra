import type { PrizeTemplate } from 'src/types/schema'

import boothAA from 'src/assets/booths/AA.webp'
import boothAAL from 'src/assets/booths/AAL.webp'
import boothADM from 'src/assets/booths/ADM.webp'
import boothAHM from 'src/assets/booths/AHM.webp'
import boothAOP from 'src/assets/booths/AOP.webp'
import boothAGIT from 'src/assets/booths/AGIT.webp'
import boothIAMI from 'src/assets/booths/IAMI.webp'
import boothKRA from 'src/assets/booths/KRA.webp'
import boothPAMA from 'src/assets/booths/PAMA.webp'
import boothTTA from 'src/assets/booths/TTA.webp'
import boothUT from 'src/assets/booths/UT.webp'
import boothUTPE from 'src/assets/booths/UTPE.webp'

// Email Lists for Authentication
export const ADMIN_EMAILS = [
  'dnmiloen@gmail.com',
  'hafrinugraha@gmail.com',
  'herrywitoko@absoluteeo.com',
  'indy@absoluteeo.com',
  'adi@absoluteeo.com',
  'euis.dinahandayani@ai.astra.co.id',
  'prahanggi.errica@ai.astra.co.id',
  'bening.swarajiwa@ai.astra.co.id'
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
  'staff13@expert-forum.com',
  'staff14@expert-forum.com',
  'staff15@expert-forum.com',
] as const

export const VIP_EMAILS = [
  'hafri@test.com',
  'hendra.hutahean@pamapersada.com',
  'hendri.guyjaya@pamapersada.com',
  'abdulnm@pamapersada.com',
  'etot.listyono@patria.co.id',
  'teguh.patmuryanto@patria.co.id',
  'henry.wijaya@patria.co.id',
  'david@unitedtractors.com',
  'efredi.yudianto@asmincoal.co.id',
  'nasihin@kra.co.id',
  'ronny.kusgianta@component.astra.co.id',
  'nawang.wulan@component.astra.co.id',
  'd.surya@akebono-astra.co.id',
  'dian.metias@component.astra.co.id',
  'donny.novanda@component.astra.co.id',
  'syamsul.h@federalnittan.com',
  'hari.purwanto.a9m@ap.denso.com',
  'kurniawan.rahardono@daihatsu.astra.co.id',
  'anjar.rosjadi@daihatsu.astra.co.id',
  'bagus.wahyujati@daihatsu.astra.co.id',
  'budhi.santoso@daihatsu.astra.co.id',
  'edwin@astra-honda.com',
  'anton.rusli@isuzu.astra.co.id',
  'rokky.irvayandi@isuzu.astra.co.id',
  'rodko.purba@isuzu.astra.co.id',
  'tetfa@astra-agro.co.id',
  'bsahari@astra-agro.co.id',
  'epwibisono@astra-agro.co.id',
  'tingning@astra-agro.co.id',
  'acirawan@astra-agro.co.id',
  'widayanto@astra-agro.co.id',
  'hendrix.pramana@astragraphia.co.id',
  'widi.triwibowo@ag-it.com',
  'sigit.hermansyah@ag-it.com',
  'michael.tanaraga@ag-it.com',
  'henry.tedjakusuma@astragraphia.co.id',
  'magatisianus@asuransiastra.com',
  'msiregar@asuransiastra.com',
  'tandayani@asuransiastra.com',
  'boy.kelana@ai.astra.co.id',
  'david.kurniawan@igp-astra.co.id',
  'anton.handoko@ai.astra.co.id',
  'gama.yogotomo@ai.astra.co.id',
  'theresia.ninawati@ai.astra.co.id',
  'matilda.esther@ai.astra.co.id',
  'endra.ananto@ai.astra.co.id',
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
  "PT Astra Otoparts Tbk - EDC",
  "PT Astra Otoparts Tbk - HO",
  "PT Astra Otoparts Tbk - Nusametal",
  "PT Astra Otoparts Tbk - WINTEQ",
  "PT Astra Visteon Indonesia",
  "PT Astra Visteon Vietnam",
  "PT Asuransi Astra Buana",
  "PT Autoplastik Indonesia",
  "PT Century Batteries Indonesia",
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
// https://www.expertforum2025.com/participant/booth?booth_id=12a52905-c6c5-408c-b12a-568c5a600eaf
export const BOOTH_VISUAL_IMAGES: Record<string, string | null> = {
  '12a52905-c6c5-408c-b12a-568c5a600eaf': boothAHM,
  '4da08db7-0db4-4b84-966c-ea9d974671c0': boothUTPE,
  '610072db-c561-4de6-99c1-ea12d0e5aa63': boothPAMA,
  '73dd86e3-b5c8-4a3a-b90c-b4abc0a09714': boothUT,
  '78ef5a3e-4d60-4b3e-a139-1101ce041298': boothAA,
  '81c20c06-1742-4e8e-97c4-277cdca9be91': boothTTA,
  '8f31cc0b-7031-4a2c-9dc3-a762fc77f0d6': boothKRA,
  '93f6eb05-6a66-47d6-964e-3393d3ef85ad': boothAAL,
  '97458e29-dac0-40be-bcf5-a3d82c7848dc': boothAOP,
  'a8508212-99b7-4a4f-9f88-a33415a7b370': boothAGIT,
  'f96b982c-c5f6-4ab9-8e8f-e800d357dc07': boothIAMI,
  'fcd6f56e-7b43-44a1-b3b4-adebbfad10bd': boothADM,
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

// ==================== Prize Templates ====================
// Offline Prizes (Individual draws - 1 winner per draw)
export const OFFLINE_PRIZE_TEMPLATES: PrizeTemplate[] = [
  {
    id: 'offline-ipad-11-2025',
    name: 'iPad 11 2025 128GB',
    prizeId: 'ipad_11_2025',
    slotCount: 1,
    description: 'Grand Prize - iPad 11 2025 128GB',
    icon: 'Tablet',
    participantType: 'offline',
    category: 'grand',
  },
  {
    id: 'offline-tcl-qled-40',
    name: 'TCL Ultimate QLED FHD TV 40 inch',
    prizeId: 'tcl_qled_40',
    slotCount: 1,
    description: 'Major Prize - TCL TV 40"',
    icon: 'Tv',
    participantType: 'offline',
    category: 'major',
  },
  {
    id: 'offline-huawei-freeclip',
    name: 'HUAWEI FreeClip Open-Ear',
    prizeId: 'huawei_freeclip',
    slotCount: 1,
    description: 'Major Prize - HUAWEI FreeClip',
    icon: 'Headphones',
    participantType: 'offline',
    category: 'major',
  },
  {
    id: 'offline-xiaomi-robot-e5',
    name: 'Xiaomi Robot Vacuum E5',
    prizeId: 'xiaomi_robot_e5',
    slotCount: 1,
    description: 'Major Prize - Xiaomi Robot Vacuum',
    icon: 'Bot',
    participantType: 'offline',
    category: 'major',
  },
  {
    id: 'offline-hydroflask-24',
    name: 'Hydro Flask 24oz',
    prizeId: 'hydroflask_24',
    slotCount: 1,
    description: 'Minor Prize - Hydro Flask 24oz',
    icon: 'Coffee',
    participantType: 'offline',
    category: 'minor',
  },
  {
    id: 'offline-bolde-coffee-maker',
    name: 'BOLDe Digital Coffee Maker Fontana',
    prizeId: 'bolde_coffee_maker',
    slotCount: 1,
    description: 'Minor Prize - BOLDe Coffee Maker',
    icon: 'Coffee',
    participantType: 'offline',
    category: 'minor',
  },
  {
    id: 'offline-huawei-band-10',
    name: 'HUAWEI Band 10',
    prizeId: 'huawei_band_10',
    slotCount: 1,
    description: 'Minor Prize - HUAWEI Band 10',
    icon: 'Watch',
    participantType: 'offline',
    category: 'minor',
  },
]

// Online Prizes (Simultaneous draw - all prizes drawn at once)
// Each slot in the online template represents a different prize
export const ONLINE_PRIZES_DATA = [
  {
    prizeId: 'xiaomi_google_tv_32',
    prizeName: 'Xiaomi Google TV A 32 Pro',
    category: 'major' as const,
  },
  {
    prizeId: 'shokz_openmove',
    prizeName: 'Shokz OpenMove',
    category: 'major' as const,
  },
  {
    prizeId: 'samsung_fit3',
    prizeName: 'Samsung Galaxy Fit3',
    category: 'major' as const,
  },
  {
    prizeId: 'hydroflask_21',
    prizeName: 'Hydro Flask 21oz',
    category: 'minor' as const,
  },
  {
    prizeId: 'bolde_air_fryer',
    prizeName: 'BOLDe Smart Air Fryer',
    category: 'minor' as const,
  },
]

// Online template - draws all 5 prizes simultaneously
export const ONLINE_PRIZE_TEMPLATE: PrizeTemplate = {
  id: 'online-all-prizes',
  name: 'Online Prizes',
  prizeId: 'online_all_prizes',
  slotCount: 5,
  description: '5 Online Winners - Multiple Prizes',
  icon: 'Gift',
  participantType: 'online',
  category: 'major', // Mixed category (has both major and minor)
}

// Combined prize templates for selector
export const PRIZE_TEMPLATES: PrizeTemplate[] = [
  ...OFFLINE_PRIZE_TEMPLATES,
  ONLINE_PRIZE_TEMPLATE,
]

export const DEFAULT_TEMPLATE = OFFLINE_PRIZE_TEMPLATES[0]!

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