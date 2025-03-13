const CACHE_NAME = "juego-globos-cache-v1";
const urlsToCache = [
    "index.html",
    "script.js",
    "style.css",
    "globo.jpg",
    "icon-192.png",
    "icon-512.png"
];

// Instalar Service Worker y guardar archivos en caché
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Servir archivos desde la caché
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
