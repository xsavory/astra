import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from 'src/types/database'

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noOpLock = async (__name: string, __acquireTimeout: number, fn: () => Promise<any>) => {
  return await fn()
}

// Create Supabase client with TypeScript support
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      lock: noOpLock,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// Export for convenience
export default supabase
