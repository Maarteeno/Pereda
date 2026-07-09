var APP_VERSION = 'v25';
var CACHE_NAME = 'pereda-tablet-' + APP_VERSION;
var ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/reviews-data.js',
  './js/app.js',
  './manifest.json',
  './assets/adrian-pereda.png',
  './assets/bestune-front.png',
  './assets/bestune-side.png',
  './assets/bestune-rear.png',
  './assets/destinations/punta-del-este.jpg',
  './assets/destinations/colonia.jpg',
  './assets/destinations/eventos.jpg',
  './assets/destinations/aeropuerto.jpg',
  './assets/spots/la-mano.jpg',
  './assets/spots/playa-brava.jpg',
  './assets/spots/puerto-punta.jpg',
  './assets/spots/barrio-historico.jpg',
  './assets/spots/faro-colonia.jpg',
  './assets/spots/calle-suspiros.jpg',
  './assets/spots/salones-pde.jpg',
  './assets/spots/hoteles-costa.jpg',
  './assets/spots/montevideo-centro.jpg',
  './assets/spots/carrasco.jpg',
  './assets/spots/buquebus.jpg',
  './assets/spots/hoteles-mvd.jpg',
  './assets/spots/gorriti.jpg',
  './assets/spots/rambla-colonia.jpg',
  './assets/spots/boda-costa.jpg',
  './assets/spots/vuelo-seguimiento.jpg',
  './assets/whatsapp-qr.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'
];

function isNetworkFirstAsset(url) {
  return /\.(html|css|js)(\?|$)/.test(url.pathname) ||
    url.pathname.endsWith('/') ||
    url.pathname.indexOf('/js/') !== -1 ||
    url.pathname.indexOf('/css/') !== -1;
}

function networkFirst(request) {
  return fetch(request).then(function (response) {
    if (response && response.status === 200 && response.type !== 'opaque') {
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(request, copy);
      });
    }
    return response;
  }).catch(function () {
    return caches.match(request);
  });
}

function cacheFirst(request) {
  return caches.match(request).then(function (cached) {
    if (cached) return cached;
    return fetch(request).then(function (response) {
      if (!response || response.status !== 200 || response.type === 'opaque') {
        return response;
      }
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(request, copy);
      });
      return response;
    });
  });
}

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== CACHE_NAME;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') {
    return;
  }

  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate' || isNetworkFirstAsset(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request).catch(function () {
    if (event.request.mode === 'navigate') {
      return caches.match('./index.html');
    }
  }));
});
