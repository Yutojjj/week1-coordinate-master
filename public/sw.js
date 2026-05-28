const CACHE_NAME = "coord-master-v3";
const STATIC_ASSETS = [
  "/",
  "/menu",
  "/bgm/Sunlit_Meadow_Path.mp3",
  "/bgm/Banners_at_the_Gate.mp3",
  "/sprites/menu_bg.jpg",
  "/sprites/player_front.png",
  "/sprites/player_hurt.png",
  "/sprites/enemy_orc.png",
  "/sprites/enemy_bat.png",
  "/sprites/magic_circle.png",
  "/sprites/coin_frame1.png",
  "/sprites/mode_programming.png",
  "/sprites/mode_typing.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});