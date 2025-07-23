const CACHE_NAME = 'psique-io-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/index.tsx',

  // CDN dependencies from importmap
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.0/',
  'https://esm.sh/react-dom@^19.1.0/',
  'https://esm.sh/recharts@^3.1.0',
  'https://esm.sh/axios@1.7.2',
  'https://esm.sh/@google/genai',
  'https://esm.sh/path@^0.12.7',
  'https://esm.sh/vite@^7.0.5',
  'https://esm.sh/url@^0.11.4',

  // Fonts and images
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://iili.io/Fj3RQpf.png', // background image

  // PWA Icons
  'https://iili.io/Jb5y7Gs.png',
  'https://iili.io/Jb5ySZF.png',
  'https://iili.io/Jb5yUbv.png',
  'https://iili.io/Jb5yX7p.png'
];

// Install event: open a cache and add the app shell files to it
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // addAll is atomic, if one fails, all fail. We catch to prevent SW install failure.
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Failed to cache all URLs during install:', err);
        });
      })
  );
});

// Fetch event: serve from cache or fetch from network
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' || event.request.url.includes('openrouter.ai')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            // Cache hit - return response
            if (cachedResponse) {
              return cachedResponse;
            }

            // Not in cache - fetch from network
            return fetch(event.request).then(
              networkResponse => {
                // Check if we received a valid response to cache
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                    return networkResponse;
                }
                
                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });

                return networkResponse;
              }
            ).catch(error => {
                console.error('Fetch failed:', error);
            });
        })
    );
});


// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
