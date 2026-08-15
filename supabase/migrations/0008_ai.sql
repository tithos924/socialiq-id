-- Phase 3: Database — AI generation logging and usage tracking

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  generation_type text not null, -- strategy | content_idea | video_script | caption | analysis | ...
  model text not null,
  input_tokens integer,
  output_tokens integer,
  prompt_version text,
  result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_generations_org_id on public.ai_generations(organization_id);
create index if not exists idx_ai_generations_type on public.ai_generations(generation_type);

alter table public.ai_generations enable row level security;

create policy "org members can read ai generations"
  on public.ai_generations for select
  using (public.is_org_member(organization_id));

-- Inserts happen server-side (Edge Functions / Route Handlers) using the
-- user's session — members can log their own generations.
create policy "org members can create ai generations"
  on public.ai_generations for insert
  with check (public.is_org_member(organization_id));

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  usage_date date not null default current_date,
  tokens_used integer not null default 0,
  generations_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, usage_date)
);

create index if not exists idx_ai_usage_org_id on public.ai_usage(organization_id);

alter table public.ai_usage enable row level security;

create policy "org members can read ai usage"
  on public.ai_usage for select
  using (public.is_org_member(organization_id));
