// SubTracker Service Worker — handles push notifications

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

self.addEventListener('push', function(event) {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'subtracker-reminder',
    renotify: true,
    data: { url: data.url || '/dashboard' },
    actions: [
      { action: 'view', title: 'View Dashboard' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  if (event.action === 'dismiss') return

  const url = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
