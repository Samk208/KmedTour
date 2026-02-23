-- Migration: Add user_roles table for RBAC
-- Apply in Supabase SQL editor or via: supabase db push

create type if not exists public.user_role_enum as enum ('patient', 'coordinator', 'admin');

create table if not exists public.user_roles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.user_role_enum not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists idx_user_roles_user_id on public.user_roles (user_id);

-- RLS: users read their own role, service_role manages all
alter table public.user_roles enable row level security;

drop policy if exists user_roles_self_read on public.user_roles;
create policy user_roles_self_read on public.user_roles for select
  using (auth.uid() = user_id or auth.role() = 'service_role');

drop policy if exists user_roles_service_all on public.user_roles;
create policy user_roles_service_all on public.user_roles for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Auto-assign 'patient' role when a new user signs up
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'patient')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_role on auth.users;
create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute procedure public.handle_new_user_role();
