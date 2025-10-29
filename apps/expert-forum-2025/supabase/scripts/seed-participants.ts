/**
 * Seed Participants Script
 *
 * Usage:
 *   npx tsx apps/expert-forum-2025/supabase/scripts/seed-participants.ts
 *
 * Environment variables required:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VITE_PARTICIPANT_DEFAULT_PASSWORD (optional, defaults to 'expertforum2025')
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
// @ts-expect-error: Defined in environment
const DEFAULT_PASSWORD = process.env.VITE_PARTICIPANT_DEFAULT_PASSWORD || 'expertforum2025'
const BATCH_SIZE = 50

// Sample data - replace this with your actual data or load from JSON
const PARTICIPANTS_DATA: ParticipantData[] = [
  {
    name: 'John Doe',
    email: 'john.doe@astraotoparts.com',
    participant_type: 'offline',
    company: 'Astra Otoparts',
    division: 'Engineering',
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@astraotoparts.com',
    participant_type: 'offline',
    company: 'Astra Otoparts',
    division: 'Marketing',
  },
  {
    name: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    participant_type: 'online',
    company: 'External Partner',
    division: 'Sales',
  },
  {
    name: 'Alice Brown',
    email: 'alice.brown@astraotoparts.com',
    participant_type: 'offline',
    company: 'Astra Otoparts',
    division: 'HR',
  },
  {
    name: 'Charlie Johnson',
    email: 'charlie.johnson@example.com',
    participant_type: 'online',
    company: 'Consultant',
    division: 'Strategy',
  },
]

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

  console.log(`Valid participants: ${validParticipants.length}\n`)

  // Process participants
  let success = 0
  let failed = 0
  let skipped = 0
  const errors: Array<{ email: string; error: string }> = []

  console.log('Starting seed process...\n')

  for (let i = 0; i < validParticipants.length; i++) {
    const participant = validParticipants[i]
    const progress = `[${i + 1}/${validParticipants.length}]`

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', participant.email)
        .maybeSingle()

      if (existingUser) {
        console.log(`${progress} SKIP: ${participant.email} (already exists)`)
        skipped++
        continue
      }

      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: participant.email,
        password: DEFAULT_PASSWORD,
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

      console.log(`${progress} OK: ${participant.name} (${participant.email})`)
      success++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`${progress} FAIL: ${participant.email} - ${errorMessage}`)
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
  console.log('\n========================================')
  console.log('Summary')
  console.log('========================================')
  console.log(`Success: ${success}`)
  console.log(`Failed:  ${failed}`)
  console.log(`Skipped: ${skipped}`)
  console.log('========================================\n')

  if (errors.length > 0) {
    console.log('Errors:')
    errors.forEach(({ email, error }) => {
      console.log(`  - ${email}: ${error}`)
    })
    console.log('')
  }

  // @ts-expect-error: Running with script
  process.exit(failed > 0 ? 1 : 0)
}

main()
