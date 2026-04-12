'use client'
import { useState, useEffect } from 'react'
import { isPushSupported, registerServiceWorker, requestPermission, scheduleLocalReminder } from '@/lib/push'
import { Subscription } from '@/lib/types'
import { differenceInDays, parseISO } from 'date-fns'

interface Props {
  subscriptions: Subscription[]
}

export default function NotificationBanner({ subscriptions }: Props) {
  const [status, setStatus] = useState<'idle' | 'prompt' | 'granted' | 'denied' | 'unsupported'>('idle')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) {
      setStatus('unsupported')
      return
    }
    const perm = Notification.permission
    if (perm === 'granted') {
      setStatus('granted')
      scheduleRemindersForSubs()
    } else if (perm === 'denied') {
      setStatus('denied')
    } else {
      // Check if user dismissed the banner before
      const wasDismissed = localStorage.getItem('notif-dismissed')
      if (!wasDismissed) setStatus('prompt')
    }
  }, [subscriptions])

  async function enableNotifications() {
    const reg = await registerServiceWorker()
    if (!reg) { setStatus('unsupported'); return }

    const perm = await requestPermission()
    setStatus(perm as any)

    if (perm === 'granted') {
      scheduleRemindersForSubs()
    }
  }

  function scheduleRemindersForSubs() {
    for (const sub of subscriptions) {
      const days = differenceInDays(parseISO(sub.next_billing_date), new Date())
      if (days >= 0 && days <= 7) {
        scheduleLocalReminder(sub.name, sub.amount, days)
      }
    }
  }

  function dismiss() {
    localStorage.setItem('notif-dismissed', '1')
    setDismissed(true)
  }

  // Already granted — silently schedule, show nothing
  if (status === 'granted' || status === 'idle' || status === 'unsupported' || dismissed) return null

  if (status === 'denied') return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
      <span className="text-lg mt-0.5">🔕</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">Notifications blocked</p>
        <p className="text-xs text-gray-400 mt-0.5">
          To get billing reminders, enable notifications for this site in your browser settings.
        </p>
      </div>
      <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 text-lg leading-none">✕</button>
    </div>
  )

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
      <span className="text-lg mt-0.5">🔔</span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-900">Get billing reminders on your phone</p>
        <p className="text-xs text-blue-600 mt-0.5">
          We'll notify you 2 days before any subscription charges — even when the app is closed.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={enableNotifications}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Enable notifications
          </button>
          <button
            onClick={dismiss}
            className="text-blue-400 hover:text-blue-600 text-xs font-medium px-2 py-2 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
