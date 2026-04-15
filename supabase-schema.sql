-- ─── Trackr AI Hub — Supabase Schema ─────────────────────────────────────────
-- Run this in your Supabase SQL editor (supabase.com → project → SQL editor)

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  username   text unique,
  role       text default 'user' check (role in ('admin', 'user')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    -- First user ever becomes admin automatically
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'user' end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Invite codes table
create table if not exists public.invite_codes (
  id         uuid default gen_random_uuid() primary key,
  code       text unique not null,
  created_by uuid references public.profiles(id) on delete cascade,
  used_by    uuid references public.profiles(id) on delete set null,
  used       boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Row-level security
alter table public.profiles    enable row level security;
alter table public.invite_codes enable row level security;

-- Profiles: users can read all, only update their own
create policy "Public profiles readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Invite codes: only admins can create/delete, anyone can read
create policy "Admins manage invites" on public.invite_codes
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Anyone can read invites" on public.invite_codes for select using (true);
