// AniStream Service Worker - handles background notifications
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Listen for messages from the main thread to show notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag, data } = event.data.payload;
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: icon || '/favicon.svg',
        badge: '/favicon.svg',
        tag: tag || 'anistream',
        data: data || {},
        requireInteraction: false,
        silent: false,
      })
    );
  }

  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, tag, data, delay } = event.data.payload;
    // Use setTimeout in the SW context to delay the notification
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: tag || 'anistream',
        data: data || {},
        requireInteraction: false,
      });
    }, delay);
  }
});

// Handle notification clicks — open/focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const animeId = event.notification.data && event.notification.data.animeId;
  const url = animeId ? `/?anime=${animeId}` : '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
