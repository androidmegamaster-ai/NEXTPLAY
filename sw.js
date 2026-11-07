const CACHE = "nextplay-shell-v2";
const SHELL = [
  "./", "./index.html", "./styles.css", "./app.js", "./manifest.json",
  "./assets/icon.svg", "./assets/icon-192.png", "./assets/icon-512.png",
  "./assets/icon-maskable-512.png", "./assets/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  // Só trata arquivos do próprio app. Mídia, YouTube e fontes passam direto pela rede.
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // Requisições de mídia usam "Range"; o cache não deve interferir nelas.
  if (req.headers.has("range")) return;

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return response;
    }).catch(() => (req.mode === "navigate" ? caches.match("./index.html") : Response.error())))
  );
});
