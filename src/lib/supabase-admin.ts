// src/lib/supabase-admin.ts
import "server-only";

import { createClient } from '@supabase/supabase-js';

// IMPORTANT: This file must NEVER be imported from a "use client" component,
// context provider, or anything else that ends up in the browser bundle.
// The `server-only` import above will throw a build-time error if that
// ever happens by accident, instead of silently shipping (or crashing on)
// an empty service-role key in the client.
//
// Only import this from: API routes (route.ts), server actions, or React
// Server Components that never render on the client.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase admin env vars missing!')
}

// Service-role client — bypasses Row Level Security. Server-only.
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})