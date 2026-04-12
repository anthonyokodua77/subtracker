import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg w-full">
        <div className="text-5xl mb-4">💸</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">SubTracker</h1>
        <p className="text-lg text-gray-500 mb-8">
          Stop losing money on forgotten subscriptions.<br />
          Track everything. Get reminded before you're charged.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/auth"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/auth"
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Sign in
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { icon: '📋', title: 'Track everything', desc: 'Add all your subs in seconds' },
            { icon: '🔔', title: 'Get reminded', desc: 'Email alerts before billing' },
            { icon: '📊', title: 'See the total', desc: 'Know your monthly spend' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-gray-800">{f.title}</div>
              <div className="text-gray-400 text-xs mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
