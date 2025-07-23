// A robust service worker for PWA functionality.
// This version is based on a proven, working example to ensure reliability.

const CACHE_NAME = 'psique-io-cache-v2'; // Bumped version to force update
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json', // Manifest is essential for PWA installability
  '/index.css',     // This is linked in index.html
  '/favicon.svg',

  // Key CDN assets
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  
  // Core Images & Icons
  'https://iili.io/Fj3RQpf.png', // Background image
  'https://iili.io/FOD9dQI.png', // PWA Icon 192
  'https://iili.io/FOD9dQI.png', // PWA Icon 512
  'https://iili.io/FOD9dQI.png', // PWA Maskable Icon 192
  'https://iili.io/FOD9dQI.png'  // PWA Maskable Icon 512
];
// Note: JavaScript modules from esm.sh will be cached on-the-fly by the fetch handler.

// Install: Open cache and add app shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        // Use addAll for atomic caching. We catch to prevent SW install from failing if one resource is unavailable.
        return cache.addAll(urlsToCache).catch(err => {
          console.error("Service Worker: Failed to cache some URLs during install.", err);
        });
      })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of the page immediately
  return self.clients.claim();
});

// Fetch: Serve from cache, fallback to network, and provide offline fallback for navigation
self.addEventListener('fetch', (event) => {
  // We only cache GET requests. We also exclude API calls.
  if (event.request.method !== 'GET' || event.request.url.includes('openrouter.ai')) {
      return; // Let the browser handle non-GET requests and specified API calls.
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache, go to network
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response to cache.
            // We allow 'opaque' for CDN requests (no-cors).
            if (
              !response || 
              response.status !== 200 || 
              (response.type !== 'basic' && response.type !== 'opaque')
            ) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and must be cloned to be consumed by both the cache and the browser.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Network request failed, probably offline.
          // If it's a navigation request, serve the main app shell page as a fallback.
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          // For other failed requests (e.g., images), we don't have a specific fallback,
          // so the browser's default error will show.
        });
      })
  );
});
