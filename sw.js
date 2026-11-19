// Service worker : rend l'appli disponible hors-ligne.
// Stratégie "stale-while-revalidate" : réponse immédiate depuis le cache,
// mise à jour en arrière-plan (la nouvelle version s'affiche au lancement suivant).
// ⚠️ Quand on ajoute un fichier, l'ajouter à ASSETS et incrémenter VERSION.

const VERSION = 'v2';
const CACHE = `francaisowen-${VERSION}`;
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/app.js',
  'js/core/rewards.js',
  'js/core/router.js',
  'js/core/session.js',
  'js/core/srs.js',
  'js/core/store.js',
  'js/core/util.js',
  'js/data/grammar.js',
  'js/data/sentences.js',
  'js/data/sounds.js',
  'js/data/words.js',
  'js/exercises/grammaire.js',
  'js/exercises/index.js',
  'js/exercises/lecture.js',
  'js/exercises/mots.js',
  'js/exercises/sons.js',
  'js/lang/word.js',
  'js/screens/chrono.js',
  'js/screens/games.js',
  'js/screens/home.js',
  'js/screens/hunt.js',
  'js/screens/learn.js',
  'js/screens/memory.js',
  'js/screens/mystery.js',
  'js/screens/parent.js',
  'js/screens/results.js',
  'js/screens/rewards.js',
  'js/screens/session.js',
  'js/screens/unitMenu.js',
  'js/ui/components.js',
  'js/ui/confetti.js',
  'js/ui/dom.js',
  'js/ui/recordings.js',
  'js/ui/sound.js',
  'js/ui/speech.js',
  'js/ui/wordView.js',
  'js/units/grammaire.js',
  'js/units/index.js',
  'js/units/lecture.js',
  'js/units/mots.js',
  'js/units/sons.js',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      const network = fetch(e.request)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) return cached;
      const res = await network;
      if (res) return res;
      if (e.request.mode === 'navigate') return cache.match('index.html');
      return new Response('', { status: 504 });
    })
  );
});
