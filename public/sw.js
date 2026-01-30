// FADES Service Worker - Smart Caching for Offline Capabilities
// Version: 1.0.0

const CACHE_VERSION = 'fades-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/exchange',
  '/dashboard/forum',
  '/dashboard/compost',
  '/dashboard/profile',
  '/images/sidebar_deco.webp',
  '/fonts/FADES.woff2',
];

// API routes that should be cached for offline use
const CACHEABLE_API_ROUTES = [
  '/api/farm',
  '/api/plans',
  '/api/forum',
  '/api/exchange',
  '/api/compost',
  '/api/water',
];

// API routes that should NEVER be cached (real-time/auth)
const NO_CACHE_API_ROUTES = [
  '/api/auth',
  '/api/demo',
  '/api/ping',
  '/api/ip',
  '/api/geo',
];

// Cache duration in milliseconds
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60 * 1000,  // 7 days
  api: 5 * 60 * 1000,                // 5 minutes
  dynamic: 24 * 60 * 60 * 1000,      // 24 hours
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => {
          return new Request(url, { credentials: 'same-origin' });
        })).catch(err => {
          console.log('[SW] Some static assets failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key.startsWith('fades-') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE)
            .map((key) => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request, url));
    return;
  }

  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation/page requests
  event.respondWith(handleNavigationRequest(request));
});

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) || 
         pathname.startsWith('/images/') || 
         pathname.startsWith('/fonts/');
}

// Handle API requests - Network first, fallback to cache
async function handleApiRequest(request, url) {
  const pathname = url.pathname;

  // Never cache auth or real-time endpoints
  if (NO_CACHE_API_ROUTES.some(route => pathname.startsWith(route))) {
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Network unavailable', offline: true }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Check if this API route should be cached
  const shouldCache = CACHEABLE_API_ROUTES.some(route => pathname.startsWith(route));

  if (!shouldCache) {
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Network unavailable', offline: true }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Network first strategy for cacheable API routes
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      const responseToCache = networkResponse.clone();
      
      // Add timestamp header for cache validation
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const body = await responseToCache.blob();
      const cachedResponse = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, checking cache for:', pathname);
    
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', pathname);
      
      // Clone response and add offline indicator
      const body = await cachedResponse.clone().text();
      let data;
      try {
        data = JSON.parse(body);
        data._offline = true;
        data._cachedAt = cachedResponse.headers.get('sw-cached-at');
      } catch {
        return cachedResponse;
      }
      
      return new Response(JSON.stringify(data), {
        status: cachedResponse.status,
        headers: { 
          'Content-Type': 'application/json',
          'X-Offline-Cache': 'true'
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Network unavailable and no cached data', 
      offline: true,
      noCache: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static assets - Cache first, fallback to network
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached version but also update cache in background
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static asset not available:', request.url);
    return new Response('', { status: 404 });
  }
}

// Handle navigation requests - Network first with offline fallback
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, checking cache:', request.url);
    
    // Try to get from dynamic cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For dashboard routes, try to serve the main dashboard page
    const url = new URL(request.url);
    if (url.pathname.startsWith('/dashboard')) {
      const dashboardCache = await caches.match('/dashboard');
      if (dashboardCache) {
        return dashboardCache;
      }
    }
    
    // Return offline page or root
    const rootCache = await caches.match('/');
    if (rootCache) {
      return rootCache;
    }
    
    return new Response('Offline - Please check your connection', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Update cache in background (stale-while-revalidate pattern)
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // Silently fail - we already have cached version
  }
}

// Handle messages from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(keys => 
        Promise.all(keys.map(key => caches.delete(key)))
      )
    );
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(cache => 
        cache.addAll(urls.map(url => new Request(url, { credentials: 'same-origin' })))
      ).catch(err => console.log('[SW] Failed to cache URLs:', err))
    );
  }
});

// Background sync for offline queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

async function syncOfflineQueue() {
  // This will be handled by the main app when online
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_OFFLINE_QUEUE' });
  });
}

console.log('[SW] Service worker loaded');
