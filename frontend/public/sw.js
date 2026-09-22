/* Service worker do Worship Stage.
 *
 * Dois objetivos:
 *  1) Tornar o app INSTALÁVEL (o Chrome/Android só oferece "instalar" quando há um
 *     SW registrado com handler de `fetch` + manifest válido).
 *  2) Um mínimo de resiliência offline, SEM servir bundle velho:
 *     - navegação (HTML): network-first → sempre pega a referência do bundle novo;
 *       cai pro shell em cache se estiver offline.
 *     - assets estáticos (nome com hash): cache-first → rápidos e seguros (um deploy
 *       novo gera nomes novos, então nunca serve um asset defasado).
 *  Só intercepta o próprio domínio; chamadas à API (Render) e a terceiros passam direto.
 *  3) Notificações push: mostra os avisos do sino com o app fechado e, ao tocar, abre
 *     (ou foca) o app na tela do aviso.
 */
const CACHE = 'worship-stage-v1';
const SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API e terceiros passam direto

  // HTML / navegação: network-first (bundle sempre atual), fallback offline pro shell.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/index.html')));
    return;
  }

  // Assets estáticos: cache-first, populando o cache no primeiro acesso.
  event.respondWith(
    caches.match(req).then((emCache) => {
      if (emCache) return emCache;
      return fetch(req).then((resp) => {
        if (resp.ok && resp.type === 'basic') {
          const copia = resp.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copia));
        }
        return resp;
      });
    }),
  );
});

// --- Notificações push ---
// Payload enviado pelo backend (pushService): { titulo, corpo, url }.
self.addEventListener('push', (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = { corpo: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(dados.titulo || 'Worship Stage', {
      body: dados.corpo || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: dados.url || '/notificacoes' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destino = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((abertas) => {
      const janela = abertas.find((c) => new URL(c.url).origin === self.location.origin);
      if (janela) {
        return janela.focus().then((c) => (c && 'navigate' in c ? c.navigate(destino) : undefined));
      }
      return self.clients.openWindow(destino);
    }),
  );
});
