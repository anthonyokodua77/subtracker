import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route is called by a cron job (e.g. Vercel Cron or a daily scheduler)
// Add to vercel.json: { "crons": [{ "path": "/api/reminders", "schedule": "0 9 * * *" }] }

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find subscriptions due in 1–3 days
  const today = new Date()
  const in3Days = new Date(today)
  in3Days.setDate(today.getDate() + 3)

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*, auth.users!inner(email)')
    .gte('next_billing_date', today.toISOString().split('T')[0])
    .lte('next_billing_date', in3Days.toISOString().split('T')[0])

  if (!subs?.length) return NextResponse.json({ sent: 0 })

  // In production: integrate with Resend.com or SendGrid to send emails
  // Example with Resend:
  //
  // import { Resend } from 'resend'
  // const resend = new Resend(process.env.RESEND_API_KEY)
  //
  // for (const sub of subs) {
  //   await resend.emails.send({
  //     from: 'reminders@yourdomain.com',
  //     to: sub.user_email,
  //     subject: `Reminder: ${sub.name} charges you $${sub.amount} soon`,
  //     html: `<p>Hi! Just a heads up — ${sub.name} will charge you $${sub.amount} on ${sub.next_billing_date}.</p>`
  //   })
  // }

  return NextResponse.json({ sent: subs.length, subs })
}
