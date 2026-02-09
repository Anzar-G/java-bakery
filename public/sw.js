/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'bakery-pwa-v1'
const PRECACHE_URLS = ['/', '/offline', '/favicon.png', '/favicon.ico', '/pwa-192.png', '/pwa-512.png']

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve(true)))))
            .then(() => self.clients.claim())
    )
})

self.addEventListener('fetch', (event) => {
    const req = event.request
    if (req.method !== 'GET') return

    const url = new URL(req.url)

    if (url.origin !== self.location.origin) return

    if (url.pathname.startsWith('/api/')) return
    if (url.pathname.startsWith('/_next/')) {
        event.respondWith(
            caches.match(req).then((cached) => {
                if (cached) return cached
                return fetch(req)
                    .then((res) => {
                        const copy = res.clone()
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy))
                        return res
                    })
                    .catch(() => cached)
            })
        )
        return
    }

    event.respondWith(
        fetch(req)
            .then((res) => {
                const copy = res.clone()
                caches.open(CACHE_NAME).then((cache) => cache.put(req, copy))
                return res
            })
            .catch(async () => {
                const cached = await caches.match(req)
                if (cached) return cached
                return caches.match('/offline')
            })
    )
})
