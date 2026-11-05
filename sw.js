// Offline support. Pages: network first, so updates show up right away; fall back to cache offline.
// Built assets and fonts: cache first (their URLs change when their content does).
const CACHE = 'lantern-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './apple-touch-icon.png'];

// Precache the shell plus the hashed JS/CSS that index.html points at, so the app opens offline
// even after a single visit.
const precache = async () => {
  const c = await caches.open(CACHE);
  await c.addAll(SHELL);
  const html = await (await c.match('./')).text();
  const assets = [...html.matchAll(/(?:src|href)="(\.?\/?assets\/[^"]+)"/g)].map((m) => m[1]);
  await c.addAll(assets);
};

self.addEventListener('install', (e) => {
  e.waitUntil(precache().catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const put = (req, res) => {
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
  }
  return res;
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => put('./', res)).catch(() => caches.match('./').then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  // Voice clips are named by a hash of their text, so a cached clip never goes stale.
  if (isFont || url.pathname.includes('/assets/') || url.pathname.includes('/voice/')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
    return;
  }
  e.respondWith(fetch(req).then((res) => put(req, res)).catch(() => caches.match(req)));
});
