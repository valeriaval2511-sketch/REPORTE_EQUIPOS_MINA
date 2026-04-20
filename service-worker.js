const CACHE = "app-mina-v10";

const BASE = "/REPORTE_EQUIPOS_MINA/";

const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "icon-192.png",
  BASE + "icon-512.png"
];

// 🔹 INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 🔹 ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🔹 FETCH (ESTO ES LO IMPORTANTE)
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  // 🔥 1. CUANDO SE ABRE LA APP (CRÍTICO)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(BASE + "index.html");
      })
    );
    return;
  }

  // 🔥 2. ARCHIVOS NORMALES
  event.respondWith(
    caches.match(event.request).then(cached => {

      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then(networkRes => {
          return caches.open(CACHE).then(cache => {
            cache.put(event.request, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => {
          return caches.match(BASE + "index.html");
        });
    })
  );
});
