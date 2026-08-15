-- Phase 3: Database — strategies

create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  period text not null, -- '7d' | '14d' | '30d' | '90d'
  summary text,
  content_mix jsonb, -- e.g. { "educational": 30, "promotional": 20, ... }
  recommended_frequency jsonb, -- e.g. { "instagram": 5, "tiktok": 3 } (posts/week)
  objectives text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_strategies_org_id on public.strategies(organization_id);

create trigger strategies_set_updated_at
  before update on public.strategies
  for each row execute function public.set_updated_at();

alter table public.strategies enable row level security;

create policy "org members can read strategies"
  on public.strategies for select
  using (public.is_org_member(organization_id));

create policy "org members can manage strategies"
  on public.strategies for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create table if not exists public.strategy_recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  strategy_id uuid references public.strategies(id) on delete cascade,
  category text, -- content_gap | opportunity | performance | niche
  title text not null,
  description text,
  priority text not null default 'medium', -- low | medium | high
  impact_score integer, -- 0-100
  status text not null default 'pending', -- pending | accepted | dismissed | done
  created_at timestamptz not null default now()
);

create index if not exists idx_strategy_recs_org_id on public.strategy_recommendations(organization_id);

alter table public.strategy_recommendations enable row level security;

create policy "org members can read strategy recommendations"
  on public.strategy_recommendations for select
  using (public.is_org_member(organization_id));

create policy "org members can manage strategy recommendations"
  on public.strategy_recommendations for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
