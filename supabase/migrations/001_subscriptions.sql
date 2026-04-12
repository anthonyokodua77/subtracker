-- Run this in your Supabase SQL editor

create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(10,2) not null,
  cycle text check (cycle in ('monthly','yearly')) not null default 'monthly',
  next_billing_date date not null,
  category text not null default 'Other',
  created_at timestamptz default now()
);

-- Row Level Security: users can only see their own subscriptions
alter table subscriptions enable row level security;

create policy "Users manage own subs" on subscriptions
  for all using (auth.uid() = user_id);
