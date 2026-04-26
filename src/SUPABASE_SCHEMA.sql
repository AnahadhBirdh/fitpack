-- ============================================================
-- FITPACK - Complete Supabase Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- 1. PROFILES TABLE
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text,
  goal_calories int default 2000,
  streak int default 0,
  total_points int default 0,
  penalty_balance int default 0,
  created_at timestamptz default now()
);

-- Row Level Security for profiles
alter table profiles enable row level security;
create policy "Public profiles viewable" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);


-- 2. MEALS TABLE
create table if not exists meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  meal_type text check (meal_type in ('breakfast','lunch','dinner')) not null,
  name text not null,
  calories int default 0,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  notes text,
  photo_url text,
  judge_result text check (judge_result in ('approved','rejected')),
  judged_by uuid references profiles(id),
  judged_at timestamptz,
  created_at timestamptz default now()
);

alter table meals enable row level security;
create policy "All users can view meals" on meals for select using (true);
create policy "Users insert own meals" on meals for insert with check (auth.uid() = user_id);
create policy "Users update own meals" on meals for update using (auth.uid() = user_id);
-- Allow others to update judge_result
create policy "Anyone can judge meals" on meals for update using (photo_url is not null and judge_result is null and auth.uid() != user_id);


-- 3. WEIGHT LOGS TABLE
create table if not exists weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  weight_kg numeric not null,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table weight_logs enable row level security;
create policy "All users can view weight logs" on weight_logs for select using (true);
create policy "Users insert own weight" on weight_logs for insert with check (auth.uid() = user_id);
create policy "Users update own weight" on weight_logs for update using (auth.uid() = user_id);


-- 4. STORAGE BUCKET FOR FOOD PHOTOS
insert into storage.buckets (id, name, public) values ('food-photos', 'food-photos', true)
on conflict do nothing;

create policy "Anyone can view food photos" on storage.objects for select using (bucket_id = 'food-photos');
create policy "Auth users can upload food photos" on storage.objects for insert with check (bucket_id = 'food-photos' and auth.role() = 'authenticated');


-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
