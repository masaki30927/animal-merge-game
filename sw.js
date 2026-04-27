const CACHE_VERSION = "20260428-4";
const CACHE_NAME = `animal-merge-v${CACHE_VERSION}`;
const PRECACHE = [
  "./",
  "./index.html",
  `./styles.css?v=${CACHE_VERSION}`,
  `./app.js?v=${CACHE_VERSION}`,
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => undefined)
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then((response) => {
          if (!response || !response.ok || response.type === "opaque") {
            return response;
          }
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, clone))
            .catch(() => undefined);
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
