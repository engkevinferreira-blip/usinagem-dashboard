// Painel Usinagem - cache offline simples (troque o nome do cache p/ forcar update)
const CACHE = 'usinagem-v202607241629';
const ATIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ATIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // pagina sempre buscada fresca (senao o painel fica preso numa versao antiga)
  const req = e.request.mode === 'navigate' ? new Request(e.request, {cache: 'reload'}) : e.request;
  e.respondWith(
    fetch(req).then(r => {
      const cp = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
