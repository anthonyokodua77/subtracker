import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Called daily by Vercel Cron (see vercel.json)
// Sends push notifications for subscriptions due in 1-3 days
//
// SETUP: Install web-push → npm install web-push
// Generate VAPID keys once: npx web-push generate-vapid-keys
// Add to Vercel env vars:
//   VAPID_PUBLIC_KEY=...
//   VAPID_PRIVATE_KEY=...
//   VAPID_EMAIL=mailto:you@yourdomain.com

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

  // Get subscriptions due soon with their users' push subscriptions
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*, push_subscriptions!inner(subscription)')
    .gte('next_billing_date', today.toISOString().split('T')[0])
    .lte('next_billing_date', in3Days.toISOString().split('T')[0])

  if (!subs?.length) return NextResponse.json({ sent: 0 })

  // Dynamically import web-push (install with: npm install web-push)
  // Uncomment when you've installed web-push:
  //
  // const webpush = await import('web-push')
  // webpush.setVapidDetails(
  //   process.env.VAPID_EMAIL!,
  //   process.env.VAPID_PUBLIC_KEY!,
  //   process.env.VAPID_PRIVATE_KEY!
  // )
  //
  // let sent = 0
  // for (const sub of subs) {
  //   const days = Math.ceil(
  //     (new Date(sub.next_billing_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  //   )
  //   const payload = JSON.stringify({
  //     title: `Upcoming charge: ${sub.name}`,
  //     body: `${sub.name} will charge you $${sub.amount} in ${days} day${days === 1 ? '' : 's'}`,
  //     tag: `reminder-${sub.id}`,
  //     url: '/dashboard'
  //   })
  //   try {
  //     await webpush.sendNotification(sub.push_subscriptions.subscription, payload)
  //     sent++
  //   } catch (err) {
  //     console.error('Push failed for sub', sub.id, err)
  //   }
  // }
  // return NextResponse.json({ sent })

  return NextResponse.json({
    message: 'Uncomment the web-push code above after running: npm install web-push',
    wouldNotify: subs.length
  })
}
