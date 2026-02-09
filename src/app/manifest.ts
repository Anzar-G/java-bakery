import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Bakery Umi',
        short_name: 'Bakery Umi',
        description: 'Bakery Umi - Freshly Baked Happiness',
        start_url: '/',
        display: 'standalone',
        background_color: '#fbfaf9',
        theme_color: '#EE4D2D',
        icons: [
            {
                src: '/pwa-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/pwa-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/pwa-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}
