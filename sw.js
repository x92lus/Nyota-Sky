// Nom du cache
const CACHE_NAME = 'nyota-sky-cache-v1';

// Fichiers à mettre en cache lors de l'installation
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './ic_launcher.png', // Votre icône
  'https://unpkg.com/leaflet@1.4.0/dist/leaflet.js',
  'https://api.windy.com/assets/map-forecast/libBoot.js',
  'https://kit.fontawesome.com/a6b0b5c0e4.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  // Ajoutez ici toutes les autres ressources statiques (CSS, JS, images)
];

// Événement d'installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Événement de récupération (fetch) - Intercepte les requêtes réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est dans le cache, la renvoyer
        if (response) {
          return response;
        }
        // Sinon, récupérer la ressource du réseau
        return fetch(event.request).then(
          (response) => {
            // Vérifier si nous avons reçu une réponse valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloner la réponse car elle est un flux et ne peut être lue qu'une fois
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Événement d'activation du Service Worker - Nettoie les anciens caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Supprimer les anciens caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
