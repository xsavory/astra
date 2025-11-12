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

interface BoothQuestion {
  question: string
  options: [string, string, string, string] // Exactly 4 options (A, B, C, D)
  correct_answer: number // Index of correct answer (0-3)
}

interface BoothData {
  name: string
  description: string
  poster_url?: string | null
  questions: BoothQuestion[] // 5 multiple-choice questions per booth
  order: number
}

// @ts-expect-error: Defined in environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
// @ts-expect-error: Defined in environment
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Booth data with multiple-choice questions (5 questions per booth)
const BOOTH_DATA: BoothData[] = [
  {
    name: 'Astra Otoparts',
    description: 'Penyedia suku cadang otomotif terkemuka di Indonesia',
    poster_url: null,
    questions: [
      {
        question: 'Apa produk utama yang dihasilkan oleh Astra Otoparts?',
        options: [
          'Suku cadang otomotif',
          'Peralatan elektronik',
          'Alat berat konstruksi',
          'Produk pertanian'
        ],
        correct_answer: 0
      },
      {
        question: 'Bagaimana Astra Otoparts berkontribusi pada industri otomotif Indonesia?',
        options: [
          'Menyediakan layanan transportasi',
          'Memproduksi suku cadang berkualitas',
          'Mengimpor kendaraan dari luar negeri',
          'Membangun jalan tol'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa fokus utama inovasi Astra Otoparts?',
        options: [
          'Teknologi pertanian',
          'Teknologi keuangan',
          'Teknologi komponen otomotif',
          'Teknologi informasi'
        ],
        correct_answer: 2
      },
      {
        question: 'Astra Otoparts merupakan bagian dari grup bisnis apa?',
        options: [
          'Astra Group',
          'Salim Group',
          'Lippo Group',
          'Sinar Mas Group'
        ],
        correct_answer: 0
      },
      {
        question: 'Produk Astra Otoparts digunakan untuk?',
        options: [
          'Konstruksi bangunan',
          'Kendaraan bermotor',
          'Mesin industri tekstil',
          'Peralatan pertanian'
        ],
        correct_answer: 1
      }
    ],
    order: 1,
  },
  {
    name: 'Astra Agro Lestari',
    description: 'Perusahaan perkebunan kelapa sawit terbesar di Indonesia',
    poster_url: null,
    questions: [
      {
        question: 'Apa komoditas utama yang dikelola oleh Astra Agro Lestari?',
        options: [
          'Kopi',
          'Kelapa sawit',
          'Karet',
          'Teh'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Astra Agro Lestari menerapkan praktik pertanian berkelanjutan?',
        options: [
          'Menggunakan pestisida kimia',
          'Menerapkan sertifikasi RSPO',
          'Membuka lahan baru setiap tahun',
          'Mengabaikan lingkungan'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa produk turunan utama dari kelapa sawit?',
        options: [
          'Minyak goreng',
          'Gula pasir',
          'Tepung terigu',
          'Kecap'
        ],
        correct_answer: 0
      },
      {
        question: 'Bagaimana kontribusi Astra Agro Lestari terhadap ekonomi lokal?',
        options: [
          'Tidak memberikan dampak',
          'Menciptakan lapangan kerja',
          'Mengurangi pendapatan daerah',
          'Mengurangi kesempatan kerja'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa komitmen Astra Agro Lestari terhadap lingkungan?',
        options: [
          'Mengabaikan konservasi',
          'Membuka hutan lindung',
          'Konservasi biodiversitas',
          'Tidak peduli lingkungan'
        ],
        correct_answer: 2
      }
    ],
    order: 2,
  },
  {
    name: 'Astra Financial',
    description: 'Penyedia layanan keuangan terpercaya untuk masyarakat Indonesia',
    poster_url: null,
    questions: [
      {
        question: 'Apa layanan finansial utama yang ditawarkan Astra Financial?',
        options: [
          'Asuransi dan pembiayaan',
          'Jasa konstruksi',
          'Layanan transportasi',
          'Perdagangan alat berat'
        ],
        correct_answer: 0
      },
      {
        question: 'Bagaimana Astra Financial membantu inklusi keuangan di Indonesia?',
        options: [
          'Hanya melayani nasabah kaya',
          'Memberikan akses pembiayaan ke berbagai segmen',
          'Membatasi layanan di kota besar',
          'Menghindari masyarakat pedesaan'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa keunggulan produk pembiayaan dari Astra Financial?',
        options: [
          'Bunga sangat tinggi',
          'Proses rumit dan lama',
          'Suku bunga kompetitif',
          'Tidak ada layanan pelanggan'
        ],
        correct_answer: 2
      },
      {
        question: 'Astra Financial menyediakan pembiayaan untuk?',
        options: [
          'Kendaraan dan multifinance',
          'Hanya properti mewah',
          'Ekspor impor saja',
          'Saham dan obligasi'
        ],
        correct_answer: 0
      },
      {
        question: 'Apa bentuk layanan asuransi yang ditawarkan Astra Financial?',
        options: [
          'Hanya asuransi jiwa',
          'Asuransi umum dan jiwa',
          'Tidak ada layanan asuransi',
          'Hanya asuransi properti'
        ],
        correct_answer: 1
      }
    ],
    order: 3,
  },
  {
    name: 'United Tractors',
    description: 'Distributor alat berat dan mesin konstruksi terbesar di Indonesia',
    poster_url: null,
    questions: [
      {
        question: 'Apa peran United Tractors dalam pembangunan infrastruktur Indonesia?',
        options: [
          'Menyediakan alat berat',
          'Membangun gedung',
          'Menyediakan makanan',
          'Layanan telekomunikasi'
        ],
        correct_answer: 0
      },
      {
        question: 'Merek alat berat apa yang didistribusikan oleh United Tractors?',
        options: [
          'Honda',
          'Caterpillar',
          'Toyota',
          'Suzuki'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana United Tractors mendukung industri pertambangan?',
        options: [
          'Menyediakan alat berat dan layanan',
          'Menjual bahan bakar',
          'Membangun jalan',
          'Menyediakan tenaga kerja'
        ],
        correct_answer: 0
      },
      {
        question: 'Apa layanan tambahan yang disediakan United Tractors selain distribusi?',
        options: [
          'Asuransi kesehatan',
          'After-sales service dan spare parts',
          'Layanan catering',
          'Jasa konsultasi hukum'
        ],
        correct_answer: 1
      },
      {
        question: 'Industri apa yang menjadi target utama United Tractors?',
        options: [
          'Pertanian organik',
          'Pertambangan dan konstruksi',
          'Industri tekstil',
          'Industri makanan'
        ],
        correct_answer: 1
      }
    ],
    order: 4,
  },
  {
    name: 'Astra Honda Motor',
    description: 'Produsen sepeda motor Honda terbesar di Indonesia',
    poster_url: null,
    questions: [
      {
        question: 'Apa model sepeda motor Honda yang paling populer di Indonesia?',
        options: [
          'Honda Beat',
          'Yamaha Mio',
          'Suzuki Satria',
          'Kawasaki Ninja'
        ],
        correct_answer: 0
      },
      {
        question: 'Bagaimana Astra Honda Motor berinovasi di teknologi kendaraan ramah lingkungan?',
        options: [
          'Mengabaikan teknologi hijau',
          'Mengembangkan motor listrik',
          'Hanya fokus pada motor bensin',
          'Tidak peduli emisi'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa peran Astra Honda Motor dalam pengembangan SDM otomotif?',
        options: [
          'Tidak ada program pelatihan',
          'Hanya merekrut dari luar negeri',
          'Menyelenggarakan pelatihan teknisi',
          'Mengurangi tenaga kerja lokal'
        ],
        correct_answer: 2
      },
      {
        question: 'Berapa banyak unit motor yang diproduksi Astra Honda Motor per tahun?',
        options: [
          'Ratusan ribu unit',
          'Puluhan unit',
          'Jutaan unit',
          'Ribuan unit'
        ],
        correct_answer: 2
      },
      {
        question: 'Apa komitmen Astra Honda Motor terhadap keselamatan berkendara?',
        options: [
          'Tidak ada program keselamatan',
          'Program safety riding',
          'Hanya fokus penjualan',
          'Mengabaikan keselamatan'
        ],
        correct_answer: 1
      }
    ],
    order: 5,
  },
  {
    name: 'Astra Daihatsu Motor',
    description: 'Produsen kendaraan Daihatsu di Indonesia',
    poster_url: null,
    questions: [
      {
        question: 'Apa keunggulan kendaraan Daihatsu untuk pasar Indonesia?',
        options: [
          'Harga mahal dan mewah',
          'Irit bahan bakar dan harga terjangkau',
          'Hanya untuk ekspor',
          'Konsumsi BBM tinggi'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Astra Daihatsu Motor mendukung mobilitas masyarakat?',
        options: [
          'Menyediakan kendaraan terjangkau',
          'Hanya menjual mobil mewah',
          'Tidak peduli kebutuhan masyarakat',
          'Fokus pada kendaraan sport'
        ],
        correct_answer: 0
      },
      {
        question: 'Apa model kendaraan terkenal dari Daihatsu?',
        options: [
          'Avanza',
          'Xenia',
          'Innova',
          'Rush'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa inovasi terbaru dari Astra Daihatsu Motor?',
        options: [
          'Tidak ada inovasi',
          'Teknologi hybrid dan electric',
          'Hanya mesin diesel',
          'Mesin uap'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Astra Daihatsu Motor berkontribusi pada ekonomi lokal?',
        options: [
          'Impor semua komponen',
          'Lokalisasi produksi dan komponen',
          'Tidak menggunakan vendor lokal',
          'Semua produksi di luar negeri'
        ],
        correct_answer: 1
      }
    ],
    order: 6,
  },
  {
    name: 'Astra International',
    description: 'Perusahaan induk dari berbagai bisnis Astra Group',
    poster_url: null,
    questions: [
      {
        question: 'Apa visi utama Astra International?',
        options: [
          'Hanya mencari keuntungan',
          'Menjadi kebanggaan bangsa',
          'Fokus pasar luar negeri',
          'Mengurangi investasi lokal'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Astra International berkontribusi pada ekonomi Indonesia?',
        options: [
          'Tidak ada kontribusi',
          'Lapangan kerja dan investasi besar',
          'Hanya untuk pemilik saham',
          'Mengurangi kesempatan kerja'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa nilai-nilai utama yang dipegang Astra International?',
        options: [
          'Catur Dharma',
          'Tidak ada nilai',
          'Profit semata',
          'Individualisme'
        ],
        correct_answer: 0
      },
      {
        question: 'Berapa banyak segmen bisnis yang dikelola Astra International?',
        options: [
          'Hanya satu segmen',
          'Tujuh segmen bisnis',
          'Tidak ada segmen',
          'Dua segmen'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa komitmen Astra International terhadap sustainability?',
        options: [
          'Tidak peduli lingkungan',
          'Program CSR dan lingkungan',
          'Hanya fokus profit',
          'Mengabaikan masyarakat'
        ],
        correct_answer: 1
      }
    ],
    order: 7,
  },
  {
    name: 'Serasi Autoraya',
    description: 'Penyedia layanan transportasi dan logistik terpadu',
    poster_url: null,
    questions: [
      {
        question: 'Apa layanan utama yang ditawarkan Serasi Autoraya?',
        options: [
          'Pembuatan kendaraan',
          'Rental dan fleet management',
          'Asuransi kendaraan',
          'Jual beli properti'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Serasi Autoraya mendukung efisiensi logistik perusahaan?',
        options: [
          'Tidak ada layanan logistik',
          'Solusi manajemen armada',
          'Hanya jual kendaraan',
          'Layanan bengkel saja'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa keunggulan fleet management dari Serasi Autoraya?',
        options: [
          'Harga mahal',
          'Tidak ada monitoring',
          'Sistem terintegrasi dan efisien',
          'Pelayanan buruk'
        ],
        correct_answer: 2
      },
      {
        question: 'Jenis kendaraan apa yang disediakan oleh Serasi Autoraya?',
        options: [
          'Hanya motor',
          'Mobil, truk, dan bus',
          'Hanya sepeda',
          'Kapal laut'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Serasi Autoraya membantu perusahaan mengurangi biaya operasional?',
        options: [
          'Tidak membantu',
          'Outsourcing armada dan maintenance',
          'Menaikkan harga sewa',
          'Tidak ada solusi'
        ],
        correct_answer: 1
      }
    ],
    order: 8,
  },
  {
    name: 'Astra Graphia',
    description: 'Penyedia solusi teknologi informasi dan komunikasi',
    poster_url: null,
    questions: [
      {
        question: 'Apa solusi IT yang ditawarkan oleh Astra Graphia?',
        options: [
          'Hanya printer',
          'Document management dan IT solution',
          'Layanan catering',
          'Jasa konstruksi'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Astra Graphia membantu transformasi digital perusahaan?',
        options: [
          'Tidak ada layanan digital',
          'Solusi cloud dan automation',
          'Hanya jual hardware',
          'Menghambat digitalisasi'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa produk unggulan dari Astra Graphia?',
        options: [
          'Mobil',
          'Sistem document management',
          'Makanan',
          'Pakaian'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Astra Graphia mendukung efisiensi operasional bisnis?',
        options: [
          'Tidak ada dukungan',
          'Otomasi proses bisnis',
          'Menambah biaya',
          'Memperlambat proses'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa fokus layanan Astra Graphia di era digital?',
        options: [
          'Hanya penjualan printer',
          'Digital transformation dan cybersecurity',
          'Tidak ada fokus',
          'Layanan manual'
        ],
        correct_answer: 1
      }
    ],
    order: 9,
  },
  {
    name: 'Astra Infra',
    description: 'Pengembang infrastruktur jalan tol di Indonesia',
    poster_url: null,
    questions: [
      {
        question: 'Jalan tol apa yang dikelola oleh Astra Infra?',
        options: [
          'Cipularang dan Jakarta-Cikampek',
          'Tidak ada jalan tol',
          'Hanya jalan desa',
          'Semua jalan nasional'
        ],
        correct_answer: 0
      },
      {
        question: 'Bagaimana Astra Infra berkontribusi pada konektivitas nasional?',
        options: [
          'Tidak ada kontribusi',
          'Membangun dan mengelola jalan tol',
          'Hanya mengumpulkan tol',
          'Merusak jalan'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa inovasi teknologi yang diterapkan di jalan tol Astra Infra?',
        options: [
          'Masih manual',
          'Electronic toll collection (GTO)',
          'Tidak ada teknologi',
          'Sistem kuno'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Astra Infra menjaga kualitas jalan tol?',
        options: [
          'Tidak pernah maintenance',
          'Pemeliharaan rutin dan monitoring',
          'Dibiarkan rusak',
          'Hanya perbaikan darurat'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa manfaat jalan tol Astra Infra bagi masyarakat?',
        options: [
          'Tidak ada manfaat',
          'Memperlancar mobilitas dan logistik',
          'Menghambat transportasi',
          'Menambah kemacetan'
        ],
        correct_answer: 1
      }
    ],
    order: 10,
  },
  {
    name: 'Astra Agro Lestari',
    description: 'Perusahaan perkebunan kelapa sawit terintegrasi terkemuka',
    questions: [
      {
        question: 'Apa produk utama dari Astra Agro Lestari?',
        options: [
          'Karet',
          'Kelapa sawit dan crude palm oil (CPO)',
          'Tebu',
          'Kopi'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa komitmen Astra Agro Lestari terhadap lingkungan?',
        options: [
          'Tidak peduli lingkungan',
          'Praktik perkebunan berkelanjutan dan konservasi',
          'Menggunakan pestisida berlebihan',
          'Membuka lahan tanpa izin'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa yang dimaksud dengan perkebunan terintegrasi?',
        options: [
          'Hanya menanam satu jenis tanaman',
          'Dari budidaya hingga pengolahan CPO',
          'Hanya menjual bibit',
          'Tidak ada pengolahan'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Astra Agro Lestari memberdayakan masyarakat?',
        options: [
          'Tidak melibatkan masyarakat',
          'Program kemitraan petani plasma',
          'Hanya mempekerjakan ekspatriat',
          'Mengambil lahan tanpa kompensasi'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa sertifikasi yang dimiliki Astra Agro Lestari?',
        options: [
          'Tidak ada sertifikasi',
          'RSPO (Roundtable on Sustainable Palm Oil)',
          'ISO untuk otomotif',
          'Sertifikasi alat berat'
        ],
        correct_answer: 1
      }
    ],
    order: 11,
  },
  {
    name: 'Astra Digital',
    description: 'Platform digital dan solusi teknologi untuk ekosistem Astra',
    questions: [
      {
        question: 'Apa fokus utama Astra Digital?',
        options: [
          'Penjualan mobil fisik',
          'Transformasi digital dan platform teknologi',
          'Konstruksi jalan',
          'Perkebunan sawit'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa contoh platform yang dikembangkan Astra Digital?',
        options: [
          'Aplikasi pertanian',
          'Aplikasi e-commerce otomotif dan marketplace',
          'Game online',
          'Aplikasi perbankan tradisional'
        ],
        correct_answer: 1
      },
      {
        question: 'Bagaimana Astra Digital mendukung bisnis Astra Group?',
        options: [
          'Tidak ada kontribusi',
          'Integrasi teknologi untuk efisiensi dan customer experience',
          'Hanya membuat website',
          'Menghilangkan layanan offline'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa teknologi yang dimanfaatkan Astra Digital?',
        options: [
          'Hanya teknologi lama',
          'AI, Big Data, Cloud Computing, IoT',
          'Mesin tik dan fax',
          'Hanya email'
        ],
        correct_answer: 1
      },
      {
        question: 'Apa visi Astra Digital untuk masa depan?',
        options: [
          'Kembali ke sistem manual',
          'Menjadi digital enabler untuk ekosistem Astra',
          'Fokus hanya pada hardware',
          'Menutup semua platform digital'
        ],
        correct_answer: 1
      }
    ],
    order: 12,
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
