-- Run once in Supabase Dashboard > SQL Editor.

create table if not exists public.glove_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  settings jsonb not null default '{}',
  profiles jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table public.glove_settings enable row level security;

drop policy if exists "Users can read own glove settings" on public.glove_settings;
create policy "Users can read own glove settings"
  on public.glove_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own glove settings" on public.glove_settings;
create policy "Users can insert own glove settings"
  on public.glove_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own glove settings" on public.glove_settings;
create policy "Users can update own glove settings"
  on public.glove_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
