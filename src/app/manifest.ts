import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Wakatopo - Portfolio',
        short_name: 'Wakatopo',
        description: '3D Portfolio',
        start_url: '/',
        display: 'standalone',
        background_color: '#020202',
        theme_color: '#020202',
        icons: [
            {
                src: '/faviconwakato.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/faviconwakato.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}