const CACHE = "app-mina-v6";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALAR
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVAR
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

// FETCH → CACHE FIRST REAL
self.addEventListener("fetch", e => {

  // SOLO GET
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(res => {

      if (res) {
        return res; // 🔥 siempre cache primero
      }

      return fetch(e.request)
        .then(networkRes => {
          return caches.open(CACHE).then(cache => {
            cache.put(e.request, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => {
          // 🔥 fallback sólido
          return caches.match("./index.html");
        });
    })
  );
});
