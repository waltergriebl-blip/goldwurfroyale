importScripts("./version.js");

const CACHE_NAME = `goldwurf-royale-v${self.APP_VERSION || "dev"}`;
const APP_FILES = [
  "./",
  "./index.html",
  "./version.js",
  "./styles.css",
  "./script.js",
  "./manifest.webmanifest",
  "./background-music.wav",
  "./assets/music/high-roller.mp3",
  "./assets/music/black-iron-sky.mp3",
  "./assets/music/black-velvet-rain.mp3",
  "./assets/music/ashen-oath.mp3",
  "./assets/table-bg.png",
  "./assets/player-bg.png",
  "./assets/skins/starfrost.png",
  "./assets/skins/glutkern.png",
  "./assets/skins/kronenglut.png",
  "./assets/skins/drachenasche.png",
  "./assets/skins/astrallicht.png",
  "./assets/skins/himmelskrone.png",
  "./assets/skins/meereskrone.png",
  "./assets/skins/goldmatrix.png",
  "./assets/skins/smaragdzahn.png",
  "./assets/avatars/avatar_standard_gold.svg",
  "./assets/avatars/avatar_demon.png",
  "./assets/avatars/avatar_sun_king.png",
  "./assets/avatars/avatar_ice_skeleton.png",
  "./assets/avatars/avatar_card_master.png",
  "./assets/avatars/avatar_fortune_dealer.png",
  "./assets/avatars/avatar_dice_dealer.png",
  "./assets/avatars/avatar_demon_gambler.png",
  "./assets/avatars/avatar_meerjungfrauen.png",
  "./assets/avatars/avatar_lichtkoenigin.png",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});
