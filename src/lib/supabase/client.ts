import { createBrowserClient } from "@supabase/ssr"

/**
 * Supabase client for use in Client Components / the browser.
 * Uses the publishable key only — safe to expose, RLS enforces access.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
