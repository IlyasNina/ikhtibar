// Changer ce numéro à chaque modification de ce fichier ou de la liste FICHIERS.
const VERSION = 'v2';
const CACHE = 'ikhtibar-' + VERSION;
const FICHIERS = [
  './', 'index.html', 'manifest.json',
  'favicon.svg', 'favicon.ico', 'favicon-32x32.png', 'favicon-192x192.png',
  'apple-touch-icon.png', 'icon-512x512.png', 'icon-maskable-512x512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

// Supprime les anciennes versions du cache (seulement celles de ce site).
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k.startsWith('ikhtibar-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Réseau d'abord (sans cache HTTP), cache en secours hors connexion.
// Les polices Google et autres ressources externes ne sont pas interceptées.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(rep => {
        if (rep.ok) { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(req, copie)); }
        return rep;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
