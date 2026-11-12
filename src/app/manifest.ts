import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'WAKATO | Living Planet',
        short_name: 'WAKATO',
        description: 'WAKATO’s immersive 3D portfolio',
        start_url: '/',
        display: 'standalone',
        background_color: '#020202',
        theme_color: '#020202',
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
        ],
    };
}