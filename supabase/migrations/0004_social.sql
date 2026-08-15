-- Phase 3: Database — social platforms, accounts, posts, metrics

-- Reference catalog of platforms the app supports. Not tenant-scoped —
-- readable by any authenticated user, writable only by service role.
create table if not exists public.social_platforms (
  id text primary key, -- e.g. 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin'
  display_name text not null,
  supports_publishing boolean not null default false,
  supports_metrics boolean not null default false,
  status text not null default 'planned', -- planned | active | disabled
  created_at timestamptz not null default now()
);

alter table public.social_platforms enable row level security;

create policy "anyone authenticated can read social platforms"
  on public.social_platforms for select
  to authenticated
  using (true);

insert into public.social_platforms (id, display_name, supports_publishing, supports_metrics, status)
values
  ('instagram', 'Instagram', false, false, 'planned'),
  ('facebook', 'Facebook', false, false, 'planned'),
  ('tiktok', 'TikTok', false, false, 'planned'),
  ('youtube', 'YouTube', false, false, 'planned'),
  ('linkedin', 'LinkedIn', false, false, 'planned')
on conflict (id) do nothing;

-- Connected social accounts per organization.
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  platform text not null references public.social_platforms(id),
  platform_user_id text not null,
  username text,
  display_name text,
  -- Encrypted at rest by the caller before insert (e.g. via pgsodium or an
  -- application-level KMS). Never store plaintext tokens.
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  followers_count integer,
  status text not null default 'connected', -- connected | expired | disconnected | error
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, platform, platform_user_id)
);

create index if not exists idx_social_accounts_org_id on public.social_accounts(organization_id);

create trigger social_accounts_set_updated_at
  before update on public.social_accounts
  for each row execute function public.set_updated_at();

alter table public.social_accounts enable row level security;

create policy "org members can read social accounts"
  on public.social_accounts for select
  using (public.is_org_member(organization_id));

create policy "org admins can manage social accounts"
  on public.social_accounts for all
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- Posts imported from connected accounts.
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform_post_id text not null,
  content_type text, -- reel | carousel | image | video | story | text
  caption text,
  published_at timestamptz,
  permalink text,
  status text not null default 'published', -- published | failed | removed
  created_at timestamptz not null default now(),
  unique (social_account_id, platform_post_id)
);

create index if not exists idx_social_posts_org_id on public.social_posts(organization_id);
create index if not exists idx_social_posts_account_id on public.social_posts(social_account_id);

alter table public.social_posts enable row level security;

create policy "org members can read social posts"
  on public.social_posts for select
  using (public.is_org_member(organization_id));

create policy "org members can manage social posts"
  on public.social_posts for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Metrics recorded for a post over time (one row per sync).
create table if not exists public.post_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  post_id uuid not null references public.social_posts(id) on delete cascade,
  views integer,
  likes integer,
  comments integer,
  shares integer,
  saves integer,
  reach integer,
  impressions integer,
  engagement_rate numeric(6,4),
  recorded_at timestamptz not null default now()
);

create index if not exists idx_post_metrics_org_id on public.post_metrics(organization_id);
create index if not exists idx_post_metrics_post_id on public.post_metrics(post_id);

alter table public.post_metrics enable row level security;

create policy "org members can read post metrics"
  on public.post_metrics for select
  using (public.is_org_member(organization_id));

create policy "org members can manage post metrics"
  on public.post_metrics for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Audience-level snapshots per connected account (demographics, growth).
create table if not exists public.audience_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  followers_count integer,
  followers_growth integer,
  demographics jsonb,
  recorded_at timestamptz not null default now()
);

create index if not exists idx_audience_profiles_org_id on public.audience_profiles(organization_id);

alter table public.audience_profiles enable row level security;

create policy "org members can read audience profiles"
  on public.audience_profiles for select
  using (public.is_org_member(organization_id));

create policy "org members can manage audience profiles"
  on public.audience_profiles for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Aggregated analytics rollups (e.g. daily/weekly snapshots) used for
-- fast dashboard reads without recomputing from raw post_metrics each time.
create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete cascade,
  period text not null, -- '7d' | '30d' | '90d'
  followers integer,
  reach integer,
  impressions integer,
  engagement_rate numeric(6,4),
  recorded_at timestamptz not null default now()
);

create index if not exists idx_analytics_snapshots_org_id on public.analytics_snapshots(organization_id);

alter table public.analytics_snapshots enable row level security;

create policy "org members can read analytics snapshots"
  on public.analytics_snapshots for select
  using (public.is_org_member(organization_id));

create policy "org members can manage analytics snapshots"
  on public.analytics_snapshots for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
