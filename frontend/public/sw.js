// Listen for push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'New Notification',
    body: 'You have a new message',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
  };

  // Parse the event data if it exists
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: 'notification', // Prevents duplicates
      requireInteraction: false, // Auto-dismiss
      data: {
        url: notificationData.url || '/', // URL to navigate to on click
      },
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Navigate to the URL or home page
  const urlToOpen = event.notification.data.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url === urlToOpen && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});