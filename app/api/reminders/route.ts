import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date()
  const in3Days = new Date(today)
  in3Days.setDate(today.getDate() + 3)

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*, user_id')
    .gte('next_billing_date', today.toISOString().split('T')[0])
    .lte('next_billing_date', in3Days.toISOString().split('T')[0])

  if (!subs?.length) return NextResponse.json({ sent: 0 })

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  let sent = 0
  for (const sub of subs) {
    const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id)
    const email = userData?.user?.email
    if (!email) continue

    const days = Math.ceil(
      (new Date(sub.next_billing_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    await resend.emails.send({
      from: 'SubTracker <reminders@mysubtracks.com>',
      to: email,
      subject: `Reminder: ${sub.name} charges you $${sub.amount} in ${days} day${days === 1 ? '' : 's'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #16a34a;">💸 SubTracker Reminder</h2>
          <p style="font-size: 16px; color: #374151;">
            Just a heads up — <strong>${sub.name}</strong> will charge you 
            <strong>$${sub.amount}</strong> in <strong>${days} day${days === 1 ? '' : 's'}</strong>
            (on ${sub.next_billing_date}).
          </p>
          <a href="https://mysubtracks.com/dashboard" 
             style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            View Dashboard
          </a>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
            You're receiving this because you use SubTracker to track your subscriptions.
          </p>
        </div>
      `
    })
    sent++
  }

  return NextResponse.json({ sent })
}
