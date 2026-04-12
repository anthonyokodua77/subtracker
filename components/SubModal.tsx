'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Subscription, NewSubscription } from '@/lib/types'

const SERVICE_OPTIONS = [
  'Netflix', 'Spotify', 'Amazon', 'Gym', 'iCloud', 'YouTube',
  'Disney', 'Hulu', 'Adobe', 'Notion', 'Apple', 'Google',
  'Microsoft', 'Dropbox', 'Slack', 'Other'
]

interface Props {
  sub: Subscription | null
  onClose: () => void
  onSave: () => void
}

export default function SubModal({ sub, onClose, onSave }: Props) {
  const supabase = createClient()
  const [form, setForm] = useState<NewSubscription>({
    name: sub?.name ?? '',
    amount: sub?.amount ?? 0,
    cycle: sub?.cycle ?? 'monthly',
    next_billing_date: sub?.next_billing_date ?? '',
    category: sub?.category ?? 'Other',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key: keyof NewSubscription, val: string | number) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    if (!form.name || !form.amount || !form.next_billing_date) {
      setError('Please fill in all fields.')
      return
    }
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in.'); setSaving(false); return }

    if (sub) {
      const { error: err } = await supabase
        .from('subscriptions')
        .update({ ...form, amount: Number(form.amount) })
        .eq('id', sub.id)
      if (err) setError(err.message)
      else onSave()
    } else {
      const { error: err } = await supabase
        .from('subscriptions')
        .insert({ ...form, amount: Number(form.amount), user_id: user.id })
      if (err) setError(err.message)
      else onSave()
    }
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {sub ? 'Edit subscription' : 'Add subscription'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a service...</option>
              {SERVICE_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount || ''}
              onChange={e => set('amount', e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing cycle</label>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {(['monthly', 'yearly'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => set('cycle', c)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                    form.cycle === c ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next billing date</label>
            <input
              type="date"
              value={form.next_billing_date}
              onChange={e => set('next_billing_date', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {saving ? 'Saving...' : sub ? 'Save changes' : 'Add subscription'}
          </button>
        </div>
      </div>
    </div>
  )
}
