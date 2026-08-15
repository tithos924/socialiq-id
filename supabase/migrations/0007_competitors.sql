-- Phase 3: Database — competitor intelligence

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  platform text not null references public.social_platforms(id),
  username text not null,
  display_name text,
  profile_url text,
  status text not null default 'active', -- active | archived
  created_at timestamptz not null default now(),
  unique (organization_id, platform, username)
);

create index if not exists idx_competitors_org_id on public.competitors(organization_id);

alter table public.competitors enable row level security;

create policy "org members can read competitors"
  on public.competitors for select
  using (public.is_org_member(organization_id));

create policy "org members can manage competitors"
  on public.competitors for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Periodic snapshot of a competitor's publicly observable activity.
create table if not exists public.competitor_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  competitor_id uuid not null references public.competitors(id) on delete cascade,
  followers_count integer,
  posts_analyzed integer,
  avg_engagement_rate numeric(6,4),
  posting_frequency numeric(5,2), -- posts/week
  insights jsonb, -- recurring topics, strongest content, patterns
  recorded_at timestamptz not null default now()
);

create index if not exists idx_competitor_snapshots_org_id on public.competitor_snapshots(organization_id);
create index if not exists idx_competitor_snapshots_competitor_id on public.competitor_snapshots(competitor_id);

alter table public.competitor_snapshots enable row level security;

create policy "org members can read competitor snapshots"
  on public.competitor_snapshots for select
  using (public.is_org_member(organization_id));

create policy "org members can manage competitor snapshots"
  on public.competitor_snapshots for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
