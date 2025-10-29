/**
 * Seed Admin & Staff Script
 *
 * Usage:
 *   npx tsx apps/expert-forum-2025/supabase/scripts/seed-admin-staff.ts
 *
 * Environment variables required:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

interface AdminStaffData {
  name: string
  email: string
  password: string
  role: 'admin' | 'staff'
  phone?: string
  department?: string
}

// @ts-expect-error: Defined in environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
// @ts-expect-error: Defined in environment
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const BATCH_SIZE = 10

// Sample data - replace this with your actual data
const ADMIN_STAFF_DATA: AdminStaffData[] = [
  {
    name: 'Admin Satu',
    email: 'admin1@expert-forum.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Admin Dua',
    email: 'admin2@expert-forum.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Staff Satu',
    email: 'staff1@expert-forum.com',
    password: 'staff123',
    role: 'staff',
  },
  {
    name: 'Staff Dua',
    email: 'staff2@expert-forum.com',
    password: 'staff123',
    role: 'staff',
  },
]

async function main() {
  console.log('\n========================================')
  console.log('Seed Admin & Staff Script')
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

  const users = ADMIN_STAFF_DATA
  console.log(`Total users: ${users.length}\n`)

  // Validate users
  const validUsers: AdminStaffData[] = []
  for (let i = 0; i < users.length; i++) {
    const u = users[i]
    const errors: string[] = []

    if (!u.name || typeof u.name !== 'string' || u.name.trim() === '') {
      errors.push('name is required')
    }
    if (!u.email || typeof u.email !== 'string' || u.email.trim() === '') {
      errors.push('email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)) {
      errors.push('email format is invalid')
    }
    if (!u.password || typeof u.password !== 'string' || u.password.length < 8) {
      errors.push('password must be at least 8 characters')
    }
    if (!u.role || !['admin', 'staff'].includes(u.role)) {
      errors.push('role must be "admin" or "staff"')
    }

    if (errors.length > 0) {
      console.error(`[SKIP] Row ${i + 1}: ${errors.join(', ')}`)
    } else {
      validUsers.push({
        name: u.name.trim(),
        email: u.email.trim().toLowerCase(),
        password: u.password,
        role: u.role,
        phone: u.phone?.trim(),
        department: u.department?.trim(),
      })
    }
  }

  const adminCount = validUsers.filter((u) => u.role === 'admin').length
  const staffCount = validUsers.filter((u) => u.role === 'staff').length
  console.log(`Valid users: ${validUsers.length} (${adminCount} admin, ${staffCount} staff)\n`)

  // Process users
  let success = 0
  let failed = 0
  const errors: Array<{ email: string; error: string }> = []

  console.log('Starting seed process...\n')

  for (let i = 0; i < validUsers.length; i++) {
    const user = validUsers[i]
    const progress = `[${i + 1}/${validUsers.length}]`
    const rolePrefix = user.role === 'admin' ? 'ADMIN' : 'STAFF'

    try {
      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create auth user')

      // Insert user record in database
      const { error: dbError } = await supabase.from('users').insert({
        auth_id: authData.user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
      })

      if (dbError) {
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw dbError
      }

      console.log(`${progress} OK [${rolePrefix}]: ${user.name} (${user.email})`)
      success++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`${progress} FAIL: ${user.email} - ${errorMessage}`)
      failed++
      errors.push({ email: user.email, error: errorMessage })
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
