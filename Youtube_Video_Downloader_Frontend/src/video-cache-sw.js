// service-worker.js

// Cache names
const version = 1;
const VIDEO_CHUNKS_CACHE = 'video-chunks-cache';
const APP_STATIC_ASSETS_CACHE = 'app-static-assets';

// Static assets to cache during installation
const STATIC_ASSETS = [
  '/', // index.html
  '/main.js', // Main JavaScript bundle
  '/polyfills.js', // Polyfills
  '/runtime.js', // Runtime
  '/styles.css', // CSS styles
  // Add other static assets here (e.g., images, fonts)
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(`${APP_STATIC_ASSETS_CACHE}-v${version}`).then((cache) => {
      console.log('Caching static assets.');
      return Promise.all(
        STATIC_ASSETS.map(asset => {
          return caches.match(asset).then(response => {
            if (!response) {
              return cache.add(asset);
            }
          });
        })
      );
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.endsWith(`-v${version}`)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: Handle requests
self.addEventListener('fetch', (event) => {
  // Check if the request is for a video chunk
  if (event.request.url.includes('/video-chunk/')) {
    // Video chunk request
    event.respondWith(
      caches.open(`${VIDEO_CHUNKS_CACHE}-v${version}`).then((cache) => {
        return cache.match(event.request).then((response) => {
          // Return cached response if found
          if (response) {
            console.log('Serving cached video chunk:', event.request.url);
            return response;
          }

          // Fetch from network, cache, and return
          console.log('Fetching and caching video chunk:', event.request.url);
          return fetch(event.request).then((networkResponse) => {
            // Cache the network response
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Check if request is for a static asset. If it is, return cached response if found
      event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log("Serving cached static asset:", event.request.url);
                    return response;
                }
                // Fetch from network and return
                console.log("Fetching static asset from network:", event.request.url);
                return fetch(event.request);
            })
    );
  }
});