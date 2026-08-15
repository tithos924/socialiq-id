-- Phase 3: Database — business_profiles

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_name text not null,
  niche text,
  sub_niche text,
  country text,
  city text,
  description text,
  target_audience text,
  products text,
  services text,
  goals text[] not null default '{}',
  brand_voice text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create trigger business_profiles_set_updated_at
  before update on public.business_profiles
  for each row execute function public.set_updated_at();

alter table public.business_profiles enable row level security;

create policy "org members can read business profile"
  on public.business_profiles for select
  using (public.is_org_member(organization_id));

create policy "org members can manage business profile"
  on public.business_profiles for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
