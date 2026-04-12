import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Saves the user's push subscription endpoint to the database
// so the server can send notifications later

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { subscription, userId } = await req.json()

  if (!subscription || !userId) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  }

  // Store the push subscription in a push_subscriptions table
  // First run this SQL in Supabase:
  //   create table push_subscriptions (
  //     id uuid default gen_random_uuid() primary key,
  //     user_id uuid references auth.users(id) on delete cascade,
  //     subscription jsonb not null,
  //     created_at timestamptz default now()
  //   );
  //   alter table push_subscriptions enable row level security;
  //   create policy "Users manage own push subs" on push_subscriptions
  //     for all using (auth.uid() = user_id);

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: userId, subscription }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
