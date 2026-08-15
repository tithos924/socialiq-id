import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Admin client using the SECRET key. Bypasses Row Level Security entirely.
 *
 * SERVER-SIDE ONLY. Never import this file from a Client Component or any
 * code that ships to the browser bundle. Use only for:
 * - trusted server-side operations that must cross organization boundaries
 *   (e.g. Edge Functions, cron jobs, webhooks)
 * - operations the anon/authenticated Postgres roles are deliberately not
 *   granted (e.g. creating an organization + membership atomically during
 *   signup)
 *
 * Every use of this client must independently verify the caller is
 * authorized — it does not rely on RLS to do that for you.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient() must never be called from client-side code."
    )
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
