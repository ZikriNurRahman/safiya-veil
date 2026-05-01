// src/lib/supabase.ts
// Browser client — dipakai di Client Components
import { createBrowserClient } from '@supabase/ssr'

// Singleton agar tidak buat instance baru setiap render
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)