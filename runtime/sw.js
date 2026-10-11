// SimuPIC service worker — network-first so the app is always fresh when online
// (no stale caching during development) and fully usable offline after the
// first visit. The whole app is ~100 KB static, so this is cheap.
const CACHE = "simupic-v6";
const SHELL = ["./", "./index.html", "./core-wasm.js", "./labs.js", "./asm.js", "./editor.js", "./isa.js", "./help.js", "./count.js", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // Only handle our own files: cross-origin requests (the GoatCounter beacon) must never be
  // cached or answered from cache — each one carries a random query string, so caching them
  // would also grow the cache by one entry per page view.
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
