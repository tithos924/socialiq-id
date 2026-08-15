-- Phase 3: Database — content pillars, ideas, calendar, assets

create table if not exists public.content_pillars (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  target_percentage numeric(5,2),
  created_at timestamptz not null default now()
);

create index if not exists idx_content_pillars_org_id on public.content_pillars(organization_id);

alter table public.content_pillars enable row level security;

create policy "org members can read content pillars"
  on public.content_pillars for select
  using (public.is_org_member(organization_id));

create policy "org members can manage content pillars"
  on public.content_pillars for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- AI-generated or manually created content ideas.
create table if not exists public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  topic text,
  hook text,
  format text, -- reel | carousel | image | video | story
  platform text references public.social_platforms(id),
  objective text,
  content_pillar_id uuid references public.content_pillars(id) on delete set null,
  script text,
  caption text,
  cta text,
  hashtags text[] not null default '{}',
  score integer,
  status text not null default 'idea', -- idea | draft | ready | scheduled | published | failed
  created_at timestamptz not null default now()
);

create index if not exists idx_content_ideas_org_id on public.content_ideas(organization_id);

alter table public.content_ideas enable row level security;

create policy "org members can read content ideas"
  on public.content_ideas for select
  using (public.is_org_member(organization_id));

create policy "org members can manage content ideas"
  on public.content_ideas for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Scheduling layer over content_ideas.
create table if not exists public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  content_idea_id uuid not null references public.content_ideas(id) on delete cascade,
  scheduled_date date not null,
  scheduled_time time,
  platform text references public.social_platforms(id),
  status text not null default 'scheduled', -- scheduled | published | failed
  published_post_id uuid references public.social_posts(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_content_calendar_org_id on public.content_calendar(organization_id);
create index if not exists idx_content_calendar_date on public.content_calendar(scheduled_date);

alter table public.content_calendar enable row level security;

create policy "org members can read content calendar"
  on public.content_calendar for select
  using (public.is_org_member(organization_id));

create policy "org members can manage content calendar"
  on public.content_calendar for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Media assets attached to a content idea (uploaded images/video, or
-- references to Supabase Storage objects).
create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  content_idea_id uuid references public.content_ideas(id) on delete cascade,
  storage_path text not null,
  asset_type text not null, -- image | video | audio
  created_at timestamptz not null default now()
);

create index if not exists idx_content_assets_org_id on public.content_assets(organization_id);

alter table public.content_assets enable row level security;

create policy "org members can read content assets"
  on public.content_assets for select
  using (public.is_org_member(organization_id));

create policy "org members can manage content assets"
  on public.content_assets for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
