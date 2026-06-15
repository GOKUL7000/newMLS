import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tfablbcgnexclybefpus.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYWJsYmNnbmV4Y2x5YmVmcHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODc1OTEsImV4cCI6MjA5NjU2MzU5MX0.dW4zJGvgn6PSXsMANEQpEP3LM93ciV5_iey70FHRuFQ'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client (for API routes / server actions)
export const createServerClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tfablbcgnexclybefpus.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYWJsYmNnbmV4Y2x5YmVmcHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk4NzU5MSwiZXhwIjoyMDk2NTYzNTkxfQ.g9bPA4JOvyp3LEQQqo2g7fZ1mxA1e5_Lkz7zSl85Ev4',
    { auth: { persistSession: false } }
  )
