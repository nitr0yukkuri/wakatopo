'use client';

import dynamic from 'next/dynamic';
import type { WorldState } from '@/lib/worldStateTypes';
import { getWorldVisualProfile } from '@/lib/worldVisualProfile';

const RainParticles = dynamic(() => import('@/components/canvas/RainTransitionCanvas').then((m) => m.RainParticles), { ssr: false });
const SunraysCanvas = dynamic(() => import('@/components/canvas/effects/SunraysCanvas'), { ssr: false });
const CloudsOverlayCanvas = dynamic(() => import('@/components/canvas/effects/CloudsOverlayCanvas'), { ssr: false });
const ThunderCanvas = dynamic(() => import('@/components/canvas/effects/ThunderCanvas'), { ssr: false });
const SnowCanvas = dynamic(() => import('@/components/canvas/effects/SnowCanvas'), { ssr: false });
const NightGlowOverlay = dynamic(() => import('@/components/canvas/effects/NightGlowOverlay'), { ssr: false });

export default function WeatherEffectsVisual({
    world,
    includeRain = false,
    snowMobileScale = 1,
    includeGeshiSun = true,
}: {
    world: WorldState;
    includeRain?: boolean;
    snowMobileScale?: number;
    includeGeshiSun?: boolean;
}) {
    const { weather } = world;
    const { sunraysVariant, cloudsVariant, nightVariant, snowVariant } = getWorldVisualProfile(world, { includeGeshiSun });

    return (
        <>
            {(weather === 'Clear' || weather === 'Morning') && <SunraysCanvas key={`sunrays-${sunraysVariant}`} variant={sunraysVariant} />}
            {weather === 'Clouds' && <CloudsOverlayCanvas key={`clouds-${cloudsVariant}`} variant={cloudsVariant} />}
            {includeRain && weather === 'Rain' && <RainParticles key="rain" />}
            {weather === 'Thunder' && <RainParticles key="thunder-rain" />}
            {weather === 'Thunder' && <ThunderCanvas key="thunder" />}
            {weather === 'Snow' && <SnowCanvas key={`snow-${snowVariant}`} density={0.72} variant={snowVariant} mobileScale={snowMobileScale} />}
            {weather === 'Night' && <NightGlowOverlay key={`night-${nightVariant}`} variant={nightVariant} />}

        </>
    );
}
