/* Service worker de WanderCocktails: deja la app disponible sin conexión.
   Estrategia "stale-while-revalidate": sirve de caché al instante y
   actualiza en segundo plano, así la barra nunca se queda sin la guía.
   Al publicar cambios, subir la versión de CACHE para renovar la caché. */
const CACHE = "wandercocktails-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/data.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", ev => {
  ev.waitUntil(
    caches.open(CACHE).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", ev => {
  if (ev.request.method !== "GET") return;
  ev.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(ev.request).then(enCache => {
        const red = fetch(ev.request)
          .then(resp => {
            if (resp.ok && new URL(ev.request.url).origin === self.location.origin) {
              cache.put(ev.request, resp.clone());
            }
            return resp;
          })
          .catch(() => enCache);
        return enCache || red;
      })
    )
  );
});
