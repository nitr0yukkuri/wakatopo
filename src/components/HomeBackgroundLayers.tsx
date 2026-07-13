'use client';

import dynamic from 'next/dynamic';

const SceneClient = dynamic(() => import('@/components/canvas/SceneClient'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black" />,
});
const WeatherEffectsOverlay = dynamic(() => import('@/components/dom/WeatherEffectsOverlay'), {
    ssr: false,
});

export default function HomeBackgroundLayers() {
    return (
        <>
            <div className="fixed inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none">
                <SceneClient />
            </div>
            <WeatherEffectsOverlay snowMobileScale={0.42} />
        </>
    );
}
