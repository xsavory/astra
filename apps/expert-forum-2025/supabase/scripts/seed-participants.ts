/**
 * Seed Participants Script
 *
 * Usage:
 *   npx tsx apps/expert-forum-2025/supabase/scripts/seed-participants.ts
 *
 * Environment variables required:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * NOTE: Each participant will get a randomly generated 8-character alphanumeric password
 * Passwords are displayed in the console output for distribution to participants
 */

import { createClient } from '@supabase/supabase-js'

interface ParticipantData {
  name: string
  email: string
  participant_type: 'online' | 'offline'
  company?: string
  division?: string
}

// @ts-expect-error: Defined in environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
// @ts-expect-error: Defined in environment
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const BATCH_SIZE = 50

// Sample data - replace this with your actual data or load from JSON
const PARTICIPANTS_DATA: ParticipantData[] = [
  // {
  //   name: 'John Doe',
  //   email: 'john.doe@astraotoparts.com',
  //   participant_type: 'offline',
  //   company: 'Astra Otoparts',
  //   division: 'Engineering',
  // },
  // {
  //   name: 'Jane Smith',
  //   email: 'jane.smith@astraotoparts.com',
  //   participant_type: 'offline',
  //   company: 'Astra Otoparts',
  //   division: 'Marketing',
  // },
  // {
  //   name: 'Bob Wilson',
  //   email: 'bob.wilson@example.com',
  //   participant_type: 'online',
  //   company: 'External Partner',
  //   division: 'Sales',
  // },
  // {
  //   name: 'Alice Brown',
  //   email: 'alice.brown@astraotoparts.com',
  //   participant_type: 'offline',
  //   company: 'Astra Otoparts',
  //   division: 'HR',
  // },
  // {
  //   name: 'Charlie Johnson',
  //   email: 'charlie.johnson@example.com',
  //   participant_type: 'online',
  //   company: 'Consultant',
  //   division: 'Strategy',
  // },
  {
    name: 'Bob Sadino',
    email: 'bob.sadino@ahm.com',
    participant_type: 'offline',
    company: 'Astra Honda Motor',
    division: 'Finance',
  },
]

/**
 * Generate random 8-character alphanumeric password
 * No special characters for ease of input
 */
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789' // Excluding ambiguous chars like 0, O, 1, l, I
  let password = ''

  // Ensure at least one uppercase, one lowercase, and one number
  const upper = chars.charAt(Math.floor(Math.random() * 26))
  const lower = chars.charAt(26 + Math.floor(Math.random() * 23))
  const number = chars.charAt(49 + Math.floor(Math.random() * 8))

  password = upper + lower + number

  // Fill remaining 5 characters randomly
  for (let i = 0; i < 5; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

async function main() {
  console.log('\n========================================')
  console.log('Seed Participants Script')
  console.log('========================================\n')

  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('ERROR: Missing environment variables')
    console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')

    // @ts-expect-error: Running with script
    process.exit(1)
  }

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const participants = PARTICIPANTS_DATA
  console.log(`Total participants: ${participants.length}\n`)

  // Validate participants
  const validParticipants: ParticipantData[] = []
  for (let i = 0; i < participants.length; i++) {
    const p = participants[i]
    const errors: string[] = []

    if (!p.name || typeof p.name !== 'string' || p.name.trim() === '') {
      errors.push('name is required')
    }
    if (!p.email || typeof p.email !== 'string' || p.email.trim() === '') {
      errors.push('email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
      errors.push('email format is invalid')
    }
    if (!p.participant_type || !['online', 'offline'].includes(p.participant_type)) {
      errors.push('participant_type must be "online" or "offline"')
    }

    if (errors.length > 0) {
      console.error(`[SKIP] Row ${i + 1}: ${errors.join(', ')}`)
    } else {
      validParticipants.push({
        name: p.name.trim(),
        email: p.email.trim().toLowerCase(),
        participant_type: p.participant_type,
        company: p.company?.trim(),
        division: p.division?.trim(),
      })
    }
  }

  const onlineCount = validParticipants.filter((p) => p.participant_type === 'online').length
  const offlineCount = validParticipants.filter((p) => p.participant_type === 'offline').length
  console.log(
    `Valid participants: ${validParticipants.length} (${onlineCount} online, ${offlineCount} offline)\n`
  )

  // Process participants
  let success = 0
  let failed = 0
  const errors: Array<{ email: string; error: string }> = []
  const credentials: Array<{ name: string; email: string; password: string }> = []

  console.log('Starting seed process...\n')
  console.log('========================================')
  console.log('PARTICIPANT CREDENTIALS')
  console.log('========================================\n')

  for (let i = 0; i < validParticipants.length; i++) {
    const participant = validParticipants[i]
    const progress = `[${i + 1}/${validParticipants.length}]`
    const typePrefix = participant.participant_type === 'online' ? 'ONLINE' : 'OFFLINE'

    // Generate random password for this participant
    const password = generatePassword()

    try {
      // Create Supabase Auth user with generated password
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: participant.email,
        password: password,
        email_confirm: true,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create auth user')

      // Insert user record in database
      const { error: dbError } = await supabase.from('users').insert({
        auth_id: authData.user.id,
        name: participant.name,
        email: participant.email,
        role: 'participant',
        participant_type: participant.participant_type,
        company: participant.company,
        division: participant.division,
      })

      if (dbError) {
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw dbError
      }

      // Log credentials for distribution
      console.log(`${progress} [${typePrefix}] ${participant.name}`)
      console.log(`  Email:    ${participant.email}`)
      console.log(`  Password: ${password}\n`)

      credentials.push({
        name: participant.name,
        email: participant.email,
        password: password,
      })

      success++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`${progress} FAIL: ${participant.email} - ${errorMessage}\n`)
      failed++
      errors.push({ email: participant.email, error: errorMessage })
    }

    // Small delay between requests
    if (i > 0 && i % BATCH_SIZE === 0) {
      console.log(`\nBatch ${Math.floor(i / BATCH_SIZE)} complete. Pausing...\n`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  // Summary
  console.log('========================================')
  console.log('Summary')
  console.log('========================================')
  console.log(`Success: ${success}`)
  console.log(`Failed:  ${failed}`)
  console.log('========================================\n')

  if (errors.length > 0) {
    console.log('Errors:')
    errors.forEach(({ email, error }) => {
      console.log(`  - ${email}: ${error}`)
    })
    console.log('')
  }

  // Export credentials to CSV format for easy distribution
  if (credentials.length > 0) {
    console.log('========================================')
    console.log('CREDENTIALS CSV FORMAT')
    console.log('========================================\n')
    console.log('Name,Email,Password')
    credentials.forEach(({ name, email, password }) => {
      console.log(`"${name}","${email}","${password}"`)
    })
    console.log('')
  }

  console.log('IMPORTANT: Save these credentials securely!')
  console.log('Passwords are randomly generated and not stored in the database.')
  console.log('Participants will need these passwords to login.\n')

  // @ts-expect-error: Running with script
  process.exit(failed > 0 ? 1 : 0)
}

main()
