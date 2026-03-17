self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Hello', body: 'New Message' };
  
  const options = {
    body: data.body,
    // Ensure this path is relative to your domain root (public folder)
    icon: './newIcon.jpg', 
    // The badge is the tiny icon shown in the Android status bar
    badge: './newIcon.jpg', 
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});