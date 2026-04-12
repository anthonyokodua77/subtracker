'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account, then sign in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💸</div>
          <h1 className="text-2xl font-bold text-gray-900">SubTracker</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'signup' ? 'Create your free account' : 'Welcome back'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {(['signup', 'login'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'signup' ? 'Sign up' : 'Sign in'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {message && (
              <p className={`text-sm px-3 py-2 rounded-lg ${
                message.includes('Check') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              {loading ? 'Loading...' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
