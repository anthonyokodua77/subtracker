'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Subscription } from '@/lib/types'
import { differenceInDays, format, parseISO } from 'date-fns'
import SubModal from '@/components/SubModal'
import NotificationBanner from '@/components/NotificationBanner'

const ICONS: Record<string, string> = {
  Netflix: '🎬', Spotify: '🎵', Amazon: '📦', Gym: '💪',
  iCloud: '☁️', YouTube: '▶️', Disney: '✨', Hulu: '📺',
  Adobe: '🎨', Notion: '📝', Other: '📋', Apple: '🍎',
  Google: '🔍', Microsoft: '💻', Dropbox: '📁', Slack: '💬',
}

export default function Dashboard() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editSub, setEditSub] = useState<Subscription | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserAndLoad()
  }, [])

  async function checkUserAndLoad() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    setUserEmail(user.email ?? '')
    await loadSubs()
    setLoading(false)
  }

  async function loadSubs() {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .order('next_billing_date', { ascending: true })
    if (data) setSubs(data)
  }

  async function deleteSub(id: string) {
    await supabase.from('subscriptions').delete().eq('id', id)
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const totalMonthly = subs.reduce((acc, s) =>
    acc + (s.cycle === 'yearly' ? s.amount / 12 : s.amount), 0)

  const dueSoon = subs.filter(s => {
    const days = differenceInDays(parseISO(s.next_billing_date), new Date())
    return days >= 0 && days <= 3
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💸</span>
            <span className="font-bold text-gray-900">SubTracker</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{userEmail}</span>
            <button onClick={signOut} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Monthly', value: `$${totalMonthly.toFixed(2)}` },
            { label: 'Yearly', value: `$${(totalMonthly * 12).toFixed(0)}` },
            { label: 'Subscriptions', value: subs.length.toString() },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Push notification prompt */}
        <NotificationBanner subscriptions={subs} />

        {/* Reminders */}
        {dueSoon.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Upcoming charges</p>
            {dueSoon.map(s => {
              const days = differenceInDays(parseISO(s.next_billing_date), new Date())
              return (
                <div key={s.id} className="flex items-center gap-2 text-sm text-amber-800">
                  <span>🔔</span>
                  <span>
                    <strong>{s.name}</strong> will charge you ${s.amount.toFixed(2)} in{' '}
                    {days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'}`}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Subscription List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              All subscriptions
            </h2>
            <button
              onClick={() => { setEditSub(null); setShowModal(true) }}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              + Add
            </button>
          </div>

          {subs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-gray-500 text-sm">No subscriptions yet.</p>
              <button
                onClick={() => { setEditSub(null); setShowModal(true) }}
                className="mt-3 text-green-600 text-sm font-semibold hover:underline"
              >
                Add your first one →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {subs.map(s => {
                const days = differenceInDays(parseISO(s.next_billing_date), new Date())
                const soon = days >= 0 && days <= 3
                const icon = ICONS[s.name] ?? ICONS.Other
                return (
                  <div
                    key={s.id}
                    className={`bg-white rounded-2xl border p-4 flex items-center gap-3 transition-colors ${
                      soon ? 'border-amber-300 bg-amber-50' : 'border-gray-100'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Next: {format(parseISO(s.next_billing_date), 'MMM d, yyyy')}
                        {soon && <span className="ml-2 text-amber-600 font-medium">· Due in {days}d</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 mr-2">
                      <div className="font-semibold text-gray-900">${s.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">/{s.cycle === 'yearly' ? 'yr' : 'mo'}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditSub(s); setShowModal(true) }}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                      >✏️</button>
                      <button
                        onClick={() => deleteSub(s.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-sm"
                      >🗑️</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <SubModal
          sub={editSub}
          onClose={() => setShowModal(false)}
          onSave={async () => { await loadSubs(); setShowModal(false) }}
        />
      )}
    </div>
  )
}
