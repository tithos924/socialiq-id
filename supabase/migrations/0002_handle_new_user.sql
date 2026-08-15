-- On signup, automatically create a personal organization and make the
-- new user its owner. This runs as SECURITY DEFINER so it can bypass RLS
-- for this one, tightly-scoped operation.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
  org_slug text;
begin
  org_name := coalesce(new.raw_user_meta_data->>'business_name', 'Minha Organização');
  org_slug := 'org-' || replace(new.id::text, '-', '');

  insert into public.organizations (name, slug)
  values (org_name, org_slug)
  returning id into new_org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
