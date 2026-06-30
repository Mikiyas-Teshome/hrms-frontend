let firebaseInitialized = false;

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'FIREBASE_CONFIG' || firebaseInitialized) {
    return;
  }

  importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

  firebase.initializeApp(event.data.config);
  firebaseInitialized = true;

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    const title = data.title || payload.notification?.title || 'HRMS';
    const options = {
      body: data.body || payload.notification?.body || '',
      icon: '/favicon.ico',
      data: {
        url: data.deepLink || '/dashboard',
        notificationId: data.notificationId || '',
        companyId: data.companyId || '',
      },
    };

    self.registration.showNotification(title, options);
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return undefined;
    }),
  );
});
