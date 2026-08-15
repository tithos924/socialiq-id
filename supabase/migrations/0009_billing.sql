-- Phase 3: Database — billing

-- Plan catalog. Not tenant-scoped — public read, managed by service role.
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, -- free | starter | pro | agency
  name text not null,
  price_monthly numeric(10,2) not null default 0,
  max_workspaces integer not null default 1,
  max_social_accounts integer not null default 1,
  max_ai_generations_per_month integer not null default 10,
  features jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "anyone authenticated can read plans"
  on public.plans for select
  to authenticated
  using (true);

insert into public.plans (slug, name, price_monthly, max_workspaces, max_social_accounts, max_ai_generations_per_month)
values
  ('free', 'Free', 0, 1, 1, 10),
  ('starter', 'Starter', 19, 1, 3, 60),
  ('pro', 'Pro', 49, 1, 5, 200),
  ('agency', 'Agency', 149, 10, 25, 1000)
on conflict (slug) do nothing;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'active', -- active | past_due | canceled | trialing
  current_period_end timestamptz,
  payment_provider_customer_id text,
  payment_provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "org members can read subscription"
  on public.subscriptions for select
  using (public.is_org_member(organization_id));

-- Only admins/owners can see mutation surface; actual writes happen via
-- the billing service using the admin client after verifying a webhook.
create policy "org admins can manage subscription"
  on public.subscriptions for all
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  status text not null, -- succeeded | failed | pending | refunded
  payment_provider_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_org_id on public.payments(organization_id);

alter table public.payments enable row level security;

create policy "org admins can read payments"
  on public.payments for select
  using (public.is_org_admin(organization_id));
