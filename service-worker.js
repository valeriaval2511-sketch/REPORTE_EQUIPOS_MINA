const CACHE = "app-mina-v6";

const BASE = "/REPORTE_EQUIPOS_MINA/"; // CAMBIA ESTO

const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "icon-192.png",
  BASE + "icon-512.png"
];

// INSTALL
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", e => {

  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(res => {

      if (res) return res;

      return fetch(e.request)
        .then(networkRes => {
          return caches.open(CACHE).then(cache => {
            cache.put(e.request, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => {
          return caches.match(BASE + "index.html"); // CLAVE
        });
    })
  );
});
