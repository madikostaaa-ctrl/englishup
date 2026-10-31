const CACHE = 'englishup-v6';
const FILES = ['./', './index.html', './style.css', './app.js', './data.js', './data-advanced.js', './data-more.js', './data-pictures.js', './data-photos.js', './manifest.json', './icon-180.png', './icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
const fromNet = req => fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; });
// фото не меняются — сначала кэш; остальное сначала из сети, чтобы обновления приходили сразу
self.addEventListener('fetch', e => e.respondWith(
  e.request.url.includes('/img/')
    ? caches.match(e.request).then(r => r || fromNet(e.request))
    : fromNet(e.request).catch(() => caches.match(e.request))));
