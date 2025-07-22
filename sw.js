const CACHE_NAME = 'psique-io-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  'https://iili.io/Fj3RQpf.png',
  'https://i.imgur.com/gA3O8kP.png', // icon 192
  'https://i.imgur.com/e3gT5zI.png', // icon 512
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate the service worker and remove old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept network requests
self.addEventListener('fetch', event => {
  // Ignore non-GET requests (like API calls)
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For navigation requests (HTML), use a network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If fetch is successful, cache it and return it
          return caches.open(CACHE_NAME).then(cache => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
        .catch(() => {
          // If fetch fails (offline), return from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other requests (CSS, JS, images), use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return from cache if found
        if (response) {
          return response;
        }
        // Otherwise, fetch from network, cache, and return
        return fetch(event.request).then(
          fetchResponse => {
            if (!fetchResponse || !fetchResponse.ok) {
              return fetchResponse;
            }
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return fetchResponse;
          }
        );
      })
  );
});
