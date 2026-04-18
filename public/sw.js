// KmedTour Service Worker — Network-first with offline fallback
// Strategy: network-first for pages/API, cache-first for static assets

const CACHE_NAME = 'kmedtour-v1';
const STATIC_CACHE = 'kmedtour-static-v1';

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/en',
  '/en/clinics',
  '/en/patient-intake',
  '/manifest.webmanifest',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install: pre-cache key pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Non-fatal: some URLs may not be available at install time
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML/API, cache-first for images/fonts
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // Skip API routes and auth — always network
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/en/auth')) return;

  // Cache-first for static assets (images, fonts, icons)
  if (
    url.pathname.startsWith('/images/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback: serve cached version if available
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Last resort: serve cached homepage
          return caches.match('/en');
        });
      })
  );
});
