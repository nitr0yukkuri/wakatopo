'use client';

import { useEffect, useState } from 'react';
import SceneClient from '@/components/canvas/SceneClient';
import WeatherEffectsOverlay from '@/components/dom/WeatherEffectsOverlay';

export default function HomeBackgroundLayers() {
    const [showBackground, setShowBackground] = useState(false);

    useEffect(() => {
        const reveal = () => {
            setShowBackground(true);
        };

        window.addEventListener('pointerdown', reveal, { once: true, passive: true });
        window.addEventListener('keydown', reveal, { once: true });
        window.addEventListener('scroll', reveal, { once: true, passive: true });
        const timer = setTimeout(reveal, 15000);

        return () => {
            window.removeEventListener('pointerdown', reveal);
            window.removeEventListener('keydown', reveal);
            window.removeEventListener('scroll', reveal);
            clearTimeout(timer);
        };
    }, []);

    if (!showBackground) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none md:pointer-events-auto">
                <SceneClient />
            </div>
            <WeatherEffectsOverlay />
        </>
    );
}
