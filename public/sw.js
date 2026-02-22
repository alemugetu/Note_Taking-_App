self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Notification', body: 'You have a notification.' };
  }

  const title = data.title || 'Notification';
  const options = {
    body: data.body || data.message || '',
    data: data,
    icon: '/icons/icon-192.png' || undefined
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.noteId ? `/${event.notification.data.noteId}` : '/';
  event.waitUntil(clients.matchAll({ type: 'window' }).then( windowClients => {
    for (let client of windowClients) {
      if (client.url === url && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
