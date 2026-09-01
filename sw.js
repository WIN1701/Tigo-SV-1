const CACHE_NAME = 'app-offline-v1';

// Lista de archivos estáticos que quieres guardar para que carguen sin internet
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css', // Cambia esto por el nombre de tu archivo CSS si es diferente
    '/script.js'   // Cambia esto por el nombre de tu archivo JS principal si aplica
];

// 1. Instalación: Se guardan los archivos en la caché del navegador
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Archivos cacheados correctamente');
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Activación: Limpia cachés viejas si actualizas la versión de la app
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. Interceptar peticiones: Si no hay red, responde con lo que hay en la caché
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si está en la caché, lo devuelve; si no, intenta buscar en la red
                return response || fetch(event.request).catch(() => {
                    // Aquí puedes retornar una vista o respaldo si falla todo
                });
            })
    );
});