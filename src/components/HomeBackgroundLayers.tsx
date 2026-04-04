'use client';

import SceneClient from '@/components/canvas/SceneClient';
import WeatherEffectsOverlay from '@/components/dom/WeatherEffectsOverlay';

export default function HomeBackgroundLayers() {
    return (
        <>
            <div className="fixed inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none lg:pointer-events-auto">
                <SceneClient />
            </div>
            <WeatherEffectsOverlay />
        </>
    );
}
