# Database

Postgres via Supabase. Schema changes are made through migrations in
`supabase/migrations/`, not ad-hoc dashboard edits, so the schema stays
reproducible and auditable.

Core tables (created incrementally, phase by phase — see roadmap.md):

users, organizations, organization_members, business_profiles,
social_accounts, social_platforms, social_posts, post_metrics,
content_pillars, content_ideas, content_calendar, content_assets,
strategies, strategy_recommendations, competitors, competitor_snapshots,
audience_profiles, analytics_snapshots, ai_generations, ai_usage,
notifications, subscriptions, plans, payments, audit_logs.

Full column-level definitions live in the relevant migration files once
created — this doc is kept in sync as tables land.

RLS is mandatory on every tenant-owned table. See docs/security.md.
