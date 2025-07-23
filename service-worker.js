const CACHE_NAME = 'psique-io-cache-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.css',
  '/favicon.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://iili.io/Fj3RQpf.png' // Background image
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For navigation requests, use a network-first strategy.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other requests, use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response to cache.
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // We don't cache chrome-extension requests
            if(event.request.url.startsWith('chrome-extension://')) {
                return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetching failed:', error);
            throw error;
        });
      })
  );
});
