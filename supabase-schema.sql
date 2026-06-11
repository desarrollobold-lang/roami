-- ============================================================
-- Roami — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension (already enabled on most Supabase projects)
create extension if not exists "pgcrypto";

-- ── trips ────────────────────────────────────────────────────
create table if not exists public.trips (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  destination  text,
  start_date   date,
  end_date     date,
  currency     text not null default 'USD',
  budget       numeric(14,2),
  created_at   timestamptz not null default now()
);

alter table public.trips enable row level security;

-- Users can only see / modify their own trips
create policy "trips: select own"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "trips: insert own"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "trips: update own"
  on public.trips for update
  using (auth.uid() = user_id);

create policy "trips: delete own"
  on public.trips for delete
  using (auth.uid() = user_id);


-- ── expenses ──────────────────────────────────────────────────
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references public.trips(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  amount       numeric(14,2) not null,
  currency     text not null,
  category     text not null default 'other',
  description  text,
  date         date not null default current_date,
  receipt_url  text,
  created_at   timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "expenses: select own"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "expenses: insert own"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "expenses: update own"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "expenses: delete own"
  on public.expenses for delete
  using (auth.uid() = user_id);


-- ── split_members ─────────────────────────────────────────────
create table if not exists public.split_members (
  id       uuid primary key default gen_random_uuid(),
  trip_id  uuid not null references public.trips(id) on delete cascade,
  name     text not null,
  user_id  uuid references auth.users(id) on delete set null
);

alter table public.split_members enable row level security;

-- Trip owner can manage members
create policy "split_members: select via trip"
  on public.split_members for select
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );

create policy "split_members: insert via trip"
  on public.split_members for insert
  with check (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );

create policy "split_members: delete via trip"
  on public.split_members for delete
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );


-- ── split_entries ─────────────────────────────────────────────
create table if not exists public.split_entries (
  id         uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  member_id  uuid not null references public.split_members(id) on delete cascade,
  share      numeric(14,2) not null,
  settled    boolean not null default false
);

alter table public.split_entries enable row level security;

create policy "split_entries: select via expense"
  on public.split_entries for select
  using (
    exists (
      select 1
      from public.expenses e
      join public.trips t on t.id = e.trip_id
      where e.id = expense_id and t.user_id = auth.uid()
    )
  );

create policy "split_entries: insert via expense"
  on public.split_entries for insert
  with check (
    exists (
      select 1
      from public.expenses e
      join public.trips t on t.id = e.trip_id
      where e.id = expense_id and t.user_id = auth.uid()
    )
  );

create policy "split_entries: update via expense"
  on public.split_entries for update
  using (
    exists (
      select 1
      from public.expenses e
      join public.trips t on t.id = e.trip_id
      where e.id = expense_id and t.user_id = auth.uid()
    )
  );
