import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SubTracker — Know what you pay for',
  description: 'Track all your subscriptions in one place. Get reminders before you\'re charged.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
