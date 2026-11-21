/* Aprendiz SENAI - service worker (versão 2.6.19).
 * Guarda só a casca (tela de abertura e ícones) para abrir mesmo sem internet e mostrar o aviso.
 * Nunca intercepta o sistema do Google (outro domínio) e não guarda dados.
 * Só apaga os próprios caches (aprendiz-*). */
const CACHE = 'aprendiz-2.6.19';
const BASE = ['./', 'index.html', 'manifest.webmanifest', 'icones/icone-192.png', 'icones/icone-512.png', 'icones/apple-180.png', 'icones/favicon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.indexOf('aprendiz-') === 0 && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // sistema do Google e outros sites: direto pela rede
  if (r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/')) {
    // página: rede primeiro (pega versão nova), cópia se estiver sem internet
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(x => x || fetch(r)));
});
