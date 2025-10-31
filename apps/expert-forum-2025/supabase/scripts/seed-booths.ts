/**
 * Seed Booths Script
 *
 * Usage:
 *   npx tsx apps/expert-forum-2025/supabase/scripts/seed-booths.ts
 *
 * Environment variables required:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

interface BoothData {
  name: string
  description: string
  poster_url?: string | null
  questions: string[] // Array of questions (stored as JSONB)
  order: number
}

// @ts-expect-error: Defined in environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
// @ts-expect-error: Defined in environment
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Sample booth data - replace with actual booth information
const BOOTH_DATA: BoothData[] = [
  {
    name: 'Astra Otoparts',
    description: 'Penyedia suku cadang otomotif terkemuka di Indonesia',
    poster_url: null,
    questions: [
      'Apa produk utama yang dihasilkan oleh Astra Otoparts?',
      'Bagaimana Astra Otoparts berkontribusi pada industri otomotif Indonesia?',
      'Apa inovasi terbaru dari Astra Otoparts?',
    ],
    order: 1,
  },
  {
    name: 'Astra Agro Lestari',
    description: 'Perusahaan perkebunan kelapa sawit terbesar di Indonesia',
    poster_url: null,
    questions: [
      'Bagaimana Astra Agro Lestari menerapkan praktik pertanian berkelanjutan?',
      'Apa produk turunan kelapa sawit yang dihasilkan?',
      'Bagaimana kontribusi Astra Agro Lestari terhadap ekonomi lokal?',
    ],
    order: 2,
  },
  {
    name: 'Astra Financial',
    description: 'Penyedia layanan keuangan terpercaya untuk masyarakat Indonesia',
    poster_url: null,
    questions: [
      'Apa layanan finansial utama yang ditawarkan Astra Financial?',
      'Bagaimana Astra Financial membantu inklusi keuangan di Indonesia?',
      'Apa keunggulan produk pembiayaan dari Astra Financial?',
    ],
    order: 3,
  },
  {
    name: 'United Tractors',
    description: 'Distributor alat berat dan mesin konstruksi terbesar di Indonesia',
    poster_url: null,
    questions: [
      'Apa peran United Tractors dalam pembangunan infrastruktur Indonesia?',
      'Merek alat berat apa saja yang didistribusikan oleh United Tractors?',
      'Bagaimana United Tractors mendukung industri pertambangan?',
    ],
    order: 4,
  },
  {
    name: 'Astra Honda Motor',
    description: 'Produsen sepeda motor Honda terbesar di Indonesia',
    poster_url: null,
    questions: [
      'Apa model sepeda motor Honda yang paling populer di Indonesia?',
      'Bagaimana Astra Honda Motor berinovasi di teknologi kendaraan ramah lingkungan?',
      'Apa peran Astra Honda Motor dalam pengembangan SDM otomotif?',
    ],
    order: 5,
  },
  {
    name: 'Astra Daihatsu Motor',
    description: 'Produsen kendaraan Daihatsu di Indonesia',
    poster_url: null,
    questions: [
      'Apa keunggulan kendaraan Daihatsu untuk pasar Indonesia?',
      'Bagaimana Astra Daihatsu Motor mendukung mobilitas masyarakat?',
      'Apa inovasi terbaru dari Astra Daihatsu Motor?',
    ],
    order: 6,
  },
  {
    name: 'Astra International',
    description: 'Perusahaan induk dari berbagai bisnis Astra Group',
    poster_url: null,
    questions: [
      'Apa visi dan misi Astra International?',
      'Bagaimana Astra International berkontribusi pada ekonomi Indonesia?',
      'Apa nilai-nilai utama yang dipegang Astra International?',
    ],
    order: 7,
  },
  {
    name: 'Serasi Autoraya',
    description: 'Penyedia layanan transportasi dan logistik terpadu',
    poster_url: null,
    questions: [
      'Apa layanan utama yang ditawarkan Serasi Autoraya?',
      'Bagaimana Serasi Autoraya mendukung efisiensi logistik perusahaan?',
      'Apa keunggulan fleet management dari Serasi Autoraya?',
    ],
    order: 8,
  },
  {
    name: 'Astra Graphia',
    description: 'Penyedia solusi teknologi informasi dan komunikasi',
    poster_url: null,
    questions: [
      'Apa solusi IT yang ditawarkan oleh Astra Graphia?',
      'Bagaimana Astra Graphia membantu transformasi digital perusahaan?',
      'Apa produk unggulan dari Astra Graphia?',
    ],
    order: 9,
  },
  {
    name: 'Astra Infra',
    description: 'Pengembang infrastruktur jalan tol di Indonesia',
    poster_url: null,
    questions: [
      'Jalan tol apa saja yang dikelola oleh Astra Infra?',
      'Bagaimana Astra Infra berkontribusi pada konektivitas nasional?',
      'Apa inovasi teknologi yang diterapkan di jalan tol Astra Infra?',
    ],
    order: 10,
  },
]

async function main() {
  console.log('\n========================================')
  console.log('Seed Booths Script')
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

  console.log(`Total booths to seed: ${BOOTH_DATA.length}\n`)

  // Process booths
  let success = 0
  let failed = 0
  const errors: Array<{ name: string; error: string }> = []

  console.log('Starting seed process...\n')

  for (let i = 0; i < BOOTH_DATA.length; i++) {
    const booth = BOOTH_DATA[i]
    const progress = `[${i + 1}/${BOOTH_DATA.length}]`

    try {
      // Validate questions array
      if (!booth.questions || booth.questions.length === 0) {
        throw new Error('Booth must have at least one question')
      }

      // Insert booth with JSONB questions array
      const { error: insertError } = await supabase.from('booths').insert({
        name: booth.name,
        description: booth.description,
        poster_url: booth.poster_url,
        questions: booth.questions, // Supabase will automatically convert array to JSONB
        order: booth.order,
      })

      if (insertError) throw insertError

      console.log(
        `${progress} OK: ${booth.name} (${booth.questions.length} questions)`
      )
      success++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`${progress} FAIL: ${booth.name} - ${errorMessage}`)
      failed++
      errors.push({ name: booth.name, error: errorMessage })
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
    errors.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`)
    })
    console.log('')
  }

  // @ts-expect-error: Running with script
  process.exit(failed > 0 ? 1 : 0)
}

main()
