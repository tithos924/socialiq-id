-- Phase 2: Authentication and multi-tenancy
-- Organizations (workspaces) and their members.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'free', -- free | starter | pro | agency
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.org_role as enum ('owner', 'admin', 'member');

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists idx_organization_members_user_id
  on public.organization_members(user_id);
create index if not exists idx_organization_members_org_id
  on public.organization_members(organization_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Helper: is the current user a member of a given organization?
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
  );
$$;

-- Helper: does the current user have owner/admin role in the org?
create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

-- organizations: members can read their own org; only admins can update it.
create policy "org members can read their organization"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "org admins can update their organization"
  on public.organizations for update
  using (public.is_org_admin(id));

-- Inserts happen only via the handle_new_user trigger (security definer),
-- so no direct insert policy is granted to end users here.

-- organization_members: members can see the roster of their own org.
create policy "org members can read membership roster"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

create policy "org admins can manage membership"
  on public.organization_members for all
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));
