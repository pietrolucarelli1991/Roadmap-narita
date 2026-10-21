/* Service worker — Tokyo 2026, versione {{ app_version }}
   Salva l'app sul telefono così funziona anche senza internet.
   Questo file viene generato da Flask (route /sw.js). */

const VERSION = "{{ app_version }}";
const CORE = "core-" + VERSION;          // pagine e file di questa versione
const RUNTIME = "runtime-v1";             // font e file scaricati durante l'uso
const TILES = "tiles-v1";                 // pezzi di mappa già visti
const MAX_TILES = 300;
const PAGES = {{ pages | tojson }};
const ASSETS = {{ assets | tojson }};

// Sul PC (localhost) prima si prova la rete: così vedi subito le modifiche al codice
const DEV = ["localhost", "127.0.0.1"].includes(self.location.hostname);
const CDN_HOSTS = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

// Salva solo risposte vere: mai la pagina della password al posto dell'app
function cacheable(res) { return res && res.ok && !res.redirected; }

async function saveUrls(urls, onlyMissing) {
  const cache = await caches.open(CORE);
  await Promise.all(urls.map(async (url) => {
    try {
      if (onlyMissing && (await cache.match(url))) return;
      const res = await fetch(new Request(url, { cache: "reload", credentials: "same-origin" }));
      if (cacheable(res)) await cache.put(url, res);
    } catch (err) { /* offline o non disponibile: pazienza */ }
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(saveUrls(PAGES.concat(ASSETS), false));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith("core-") && k !== CORE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
  // Dopo l'accesso con la password, salva le pagine che ancora mancano
  if (event.data === "WARM") event.waitUntil(saveUrls(PAGES, true));
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin && (url.pathname === "/sw.js" || url.pathname === "/entra")) return;

  if (req.mode === "navigate") {
    event.respondWith(DEV ? pageNetworkFirst(req) : pageStaleWhileRevalidate(event));
    return;
  }
  if (url.hostname.endsWith("tile.openstreetmap.org")) {
    event.respondWith(tileCacheFirst(req));
    return;
  }
  if (url.origin === self.location.origin || CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(DEV ? assetNetworkFirst(req) : assetCacheFirst(req));
  }
});

/* Pagine: si apre subito la copia salvata, e intanto si scarica quella nuova */
async function pageStaleWhileRevalidate(event) {
  const req = event.request;
  const key = new URL(req.url).pathname;
  const cache = await caches.open(CORE);
  const cached = await cache.match(key);
  const network = fetch(req)
    .then((res) => { if (cacheable(res) && PAGES.includes(key)) cache.put(key, res.clone()); return res; })
    .catch(() => null);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) || (await cache.match("/")) || offlineResponse();
}

async function pageNetworkFirst(req) {
  const key = new URL(req.url).pathname;
  const cache = await caches.open(CORE);
  try {
    const res = await fetch(req);
    if (cacheable(res) && PAGES.includes(key)) cache.put(key, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(key)) || (await cache.match("/")) || offlineResponse();
  }
}

/* File (css, js, icone, font): prima la copia salvata */
async function assetCacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) (await caches.open(RUNTIME)).put(req, res.clone());
    return res;
  } catch (err) {
    return Response.error();
  }
}

async function assetNetworkFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) (await caches.open(RUNTIME)).put(req, res.clone());
    return res;
  } catch (err) {
    return (await caches.match(req)) || Response.error();
  }
}

/* Mappa: si salvano solo i pezzi già guardati, al massimo MAX_TILES */
async function tileCacheFirst(req) {
  const cache = await caches.open(TILES);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      await cache.put(req, res.clone());
      trimCache(cache, MAX_TILES);
    }
    return res;
  } catch (err) {
    return new Response("", { status: 504 });
  }
}

async function trimCache(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

function offlineResponse() {
  return new Response(
    "<!doctype html><meta charset='utf-8'><meta name='viewport' content='width=device-width'>" +
    "<body style='font-family:system-ui;padding:2rem;line-height:1.5'>" +
    "<h1>Sei offline</h1><p>Questa pagina non è ancora salvata sul telefono. " +
    "Aprila una volta con internet e da quel momento funzionerà anche offline.</p></body>",
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
