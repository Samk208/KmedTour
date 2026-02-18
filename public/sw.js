// Self-unregistering service worker.
// This file exists to clear any previously registered service worker
// that may be serving stale cached content.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    clients.forEach((client) => client.navigate(client.url));
  });
  self.registration.unregister();
});
