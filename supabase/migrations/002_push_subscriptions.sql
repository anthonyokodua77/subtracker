-- Run this in your Supabase SQL editor AFTER 001_subscriptions.sql

create table push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  subscription jsonb not null,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;

create policy "Users manage own push subs" on push_subscriptions
  for all using (auth.uid() = user_id);
