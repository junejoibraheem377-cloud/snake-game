const CACHE_NAME = "snake-game-v1";

const FILES = [
  "/snake-game/",
  "/snake-game/index.html",
  "/snake-game/style.css",
  "/snake-game/script.js",
  "/snake-game/manifest.json",
  "/snake-game/icons/icon-192.png",
  "/snake-game/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => caches.match("/snake-game/index.html"))
      );
    })
  );
});
