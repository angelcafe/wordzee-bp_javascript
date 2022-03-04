var cacheName = 'bpwordzee';
var filesToCache = [
    './',
    './index.html',
    './css/bootstrap.min.css',
    './css/index.min.css',
    './icons/facebook.png',
    './icons/telegram.png',
    './icons/wordzee-256_256.webp',
    './icons/wordzee-32_32.png',
    './icons/wordzee-64_64.jpg',
    './js/bootstrap.bundle.min.js',
    './js/index.min.js'
];
/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
    self.skipWaiting();
});

/* Serve cached content when offline */
self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
});