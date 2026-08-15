/**
 * Baseline TypeScript types mirroring the Phase 3 schema.
 *
 * These are hand-written to match the migrations in supabase/migrations/.
 * Once the Supabase CLI is available in your environment, regenerate the
 * authoritative version with:
 *
 *   npx supabase gen types typescript --project-id vhwzwwjakjrndxxzbhhe > src/types/database.ts
 *
 * and replace this file.
 */

export type OrgRole = "owner" | "admin" | "member"

export interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: OrgRole
  created_at: string
}

export interface BusinessProfile {
  id: string
  organization_id: string
  business_name: string
  niche: string | null
  sub_niche: string | null
  country: string | null
  city: string | null
  description: string | null
  target_audience: string | null
  products: string | null
  services: string | null
  goals: string[]
  brand_voice: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface SocialPlatformRow {
  id: string
  display_name: string
  supports_publishing: boolean
  supports_metrics: boolean
  status: "planned" | "active" | "disabled"
  created_at: string
}

export interface SocialAccountRow {
  id: string
  organization_id: string
  platform: string
  platform_user_id: string
  username: string | null
  display_name: string | null
  token_expires_at: string | null
  followers_count: number | null
  status: "connected" | "expired" | "disconnected" | "error"
  connected_at: string
  updated_at: string
}

export interface ContentIdea {
  id: string
  organization_id: string
  title: string
  topic: string | null
  hook: string | null
  format: string | null
  platform: string | null
  objective: string | null
  content_pillar_id: string | null
  script: string | null
  caption: string | null
  cta: string | null
  hashtags: string[]
  score: number | null
  status: "idea" | "draft" | "ready" | "scheduled" | "published" | "failed"
  created_at: string
}

export interface Strategy {
  id: string
  organization_id: string
  period: "7d" | "14d" | "30d" | "90d"
  summary: string | null
  content_mix: Record<string, number> | null
  recommended_frequency: Record<string, number> | null
  objectives: string[]
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  slug: "free" | "starter" | "pro" | "agency"
  name: string
  price_monthly: number
  max_workspaces: number
  max_social_accounts: number
  max_ai_generations_per_month: number
  features: Record<string, unknown>
  created_at: string
}
