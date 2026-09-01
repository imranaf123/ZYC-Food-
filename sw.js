/* =========================================================
   ZYC Food — service worker
   - cache-first        : static app shell (HTML/CSS/JS/icons/fonts)
   - network-first      : /data/*.json (content edits reach users fast)
   - stale-while-revalid: product & category imagery
   ========================================================= */

const VERSION = 'v1.3.0';
const SHELL_CACHE = `zyc-shell-${VERSION}`;
const DATA_CACHE = `zyc-data-${VERSION}`;
const IMAGE_CACHE = `zyc-images-${VERSION}`;
const FONT_CACHE = `zyc-fonts-${VERSION}`;

const SHELL_ASSETS = [
  'index.html',
  'menu.html',
  'product.html',
  'deals.html',
  'search.html',
  'cart.html',
  'checkout.html',
  'about.html',
  'reviews.html',
  'contact.html',
  'how-ordering-works.html',
  'favourites.html',
  '404.html',
  'manifest.json',
  'css/base.css',
  'css/components.css',
  'css/pages.css',
  'js/app.js',
  'js/data-loader.js',
  'js/cart.js',
  'js/delivery.js',
  'js/whatsapp.js',
  'js/components.js',
  'js/pages/home.js',
  'js/pages/menu.js',
  'js/pages/product.js',
  'js/pages/deals.js',
  'js/pages/search.js',
  'js/pages/cart-page.js',
  'js/pages/checkout.js',
  'js/pages/reviews.js',
  'js/pages/about.js',
  'js/pages/contact.js',
  'js/pages/orders.js',
  'js/pages/notfound.js',
  'js/pages/favourites.js',
  'images/branding/icon-192.png',
  'images/branding/icon-512.png',
  'images/branding/favicon.svg',
  'images/branding/placeholder.jpg',
];

// Warmed at install so a cold offline start still has menu content to render.
const DATA_ASSETS = [
  'data/settings.json',
  'data/hero-slides.json',
  'data/categories.json',
  'data/products.json',
  'data/customization-groups.json',
  'data/deals.json',
  'data/reviews.json',
  'data/delivery.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE)
        .then((cache) => cache.addAll(SHELL_ASSETS.map((a) => new Request(a, { cache: 'reload' })))),
      caches.open(DATA_CACHE)
        .then((cache) => cache.addAll(DATA_ASSETS.map((a) => new Request(a, { cache: 'reload' })))),
    ])
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[sw] precache failed', err)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => ![SHELL_CACHE, DATA_CACHE, IMAGE_CACHE, FONT_CACHE].includes(k))
          .map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1. Content JSON — network first, cache fallback
  if (sameOrigin && url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  // 2. Imagery — stale while revalidate
  if (sameOrigin && /\.(?:jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // 3. Google Fonts — stale while revalidate in their own bucket
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  // 4. Navigations — cache first with network refresh, offline fallback to home
  if (request.mode === 'navigate') {
    event.respondWith(
      cacheFirst(request, SHELL_CACHE).catch(() => caches.match('index.html')),
    );
    return;
  }

  // 5. Everything else same-origin (CSS/JS) — cache first
  if (sameOrigin) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
  if (cached) {
    // refresh in the background so the next visit is current
    fetch(request).then((res) => { if (res && res.ok) cache.put(request, res.clone()); }).catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}
