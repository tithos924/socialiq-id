# Database

Postgres via Supabase. Schema changes are made through migrations in
`supabase/migrations/`, not ad-hoc dashboard edits, so the schema stays
reproducible and auditable.

## Tables (all live, Phase 3 complete)

- **Identity/tenancy:** `organizations`, `organization_members`
- **Business:** `business_profiles`
- **Social:** `social_platforms` (reference catalog), `social_accounts`,
  `social_posts`, `post_metrics`, `audience_profiles`, `analytics_snapshots`
- **Content:** `content_pillars`, `content_ideas`, `content_calendar`,
  `content_assets`
- **Strategy:** `strategies`, `strategy_recommendations`
- **Competitors:** `competitors`, `competitor_snapshots`
- **AI:** `ai_generations`, `ai_usage`
- **Billing:** `plans` (seeded: free/starter/pro/agency), `subscriptions`,
  `payments`
- **Ops:** `notifications`, `audit_logs`

## Multi-tenancy pattern

Every tenant-owned table carries `organization_id` (denormalized onto
child tables like `post_metrics` and `competitor_snapshots` too, to keep
RLS policies simple — one check per table instead of a join through a
parent). RLS is enabled on every table. Two security-definer helpers do
the membership check:

- `is_org_member(org_id)` — true if the current user belongs to the org
- `is_org_admin(org_id)` — true if their role is `owner` or `admin`

Most tables: members can read/write freely (`is_org_member`). More
sensitive ones (`social_accounts`, `subscriptions`, `payments`,
`audit_logs`) restrict writes or reads to admins/owners
(`is_org_admin`).

`social_platforms` and `plans` are reference catalogs, not tenant-scoped —
public read for any authenticated user, writes reserved for the admin
client (service role).

## Auto-provisioning

`handle_new_user()` (trigger on `auth.users` insert) creates an
organization and an `owner` membership automatically on signup — every
user always has at least one workspace with no extra client-side calls.

## Types

Hand-written baseline types live in `src/types/database.ts`, matching the
migrations. Regenerate the authoritative version once the Supabase CLI is
available in your dev environment:

```
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

