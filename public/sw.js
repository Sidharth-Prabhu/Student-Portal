// Simple service worker to satisfy PWA requirements
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // basic pass-through
  event.respondWith(fetch(event.request));
});
