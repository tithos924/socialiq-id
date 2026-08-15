-- Phase 3: Database — notifications and audit logs

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null, -- analysis_complete | content_ready | post_scheduled | publishing_failed | token_expired | milestone | opportunity | weekly_report
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_org_id on public.notifications(organization_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

alter table public.notifications enable row level security;

create policy "users can read their own notifications"
  on public.notifications for select
  using (user_id = auth.uid() and public.is_org_member(organization_id));

create policy "users can update their own notifications"
  on public.notifications for update
  using (user_id = auth.uid() and public.is_org_member(organization_id))
  with check (user_id = auth.uid() and public.is_org_member(organization_id));

-- Sensitive-action audit trail. Read-only to org admins; writes happen
-- server-side via the admin client after the action is verified.
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_org_id on public.audit_logs(organization_id);

alter table public.audit_logs enable row level security;

create policy "org admins can read audit logs"
  on public.audit_logs for select
  using (public.is_org_admin(organization_id));
