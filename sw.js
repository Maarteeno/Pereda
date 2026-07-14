var APP_VERSION = 'v63';
var CACHE_NAME = 'pereda-tablet-' + APP_VERSION;
var ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/session.js',
  './js/firebase-config.js',
  './js/qrcode.min.js',
  './manifest.json',
  './assets/bestune-front.png',
  './assets/bestune-side.png',
  './assets/bestune-rear.png',
  './assets/paseos/paseos-hero-ai.png',
  './assets/destinations/traslados-hero-ai.png',
  './assets/destinations/punta-del-este-ai.png',
  './assets/destinations/colonia-ai.png',
  './assets/destinations/montevideo-ai.png',
  './assets/destinations/aeropuerto-carrasco.png',
  './assets/destinations/buquebus.png',
  './assets/paseos/montevideo-ai.png',
  './assets/paseos/eventos-ai.png',
  './assets/paseos/costa-ai.png',
  './assets/paseos/bodegas-ai.png',
  './assets/paseos/detalle/costa-pde-hoteles.png',
  './assets/paseos/detalle/costa-barra.png',
  './assets/paseos/detalle/costa-jose-ignacio.png',
  './assets/paseos/detalle/mvd-centenario.png',
  './assets/paseos/detalle/mvd-rambla.png',
  './assets/paseos/detalle/mvd-rodo.png',
  './assets/paseos/detalle/mvd-mercado.png',
  './assets/paseos/detalle/evt-boda.png',
  './assets/paseos/detalle/evt-salon.png',
  './assets/paseos/detalle/evt-congreso.png',
  './assets/paseos/detalle/bodega-bouza.png',
  './assets/paseos/detalle/bodega-juanico.png',
  './assets/paseos/detalle/bodega-garzon.png',
  './assets/paseos/detalle/bodega-carmelo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
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
