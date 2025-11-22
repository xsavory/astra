import type { PrizeTemplate } from 'src/types/schema'

import boothAA from 'src/assets/booths/AA.png'
import boothAAL from 'src/assets/booths/AAL.png'
import boothADM from 'src/assets/booths/ADM.png'
import boothAHM from 'src/assets/booths/AHM.png'
import boothAOP from 'src/assets/booths/AOP.png'
import boothAGIT from 'src/assets/booths/AGIT.png'
import boothIAMI from 'src/assets/booths/IAMI.png'
import boothKRA from 'src/assets/booths/KRA.png'
import boothPAMA from 'src/assets/booths/PAMA.png'
import boothTTA from 'src/assets/booths/TTA.png'
import boothUT from 'src/assets/booths/UT.png'
import boothUTPE from 'src/assets/booths/UTPE.png'

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