'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useStore, type WeatherType } from '@/store';

const RainParticles = dynamic(() => import('@/components/canvas/RainTransitionCanvas').then((m) => m.RainParticles), { ssr: false });
const SunraysCanvas = dynamic(() => import('@/components/canvas/effects/SunraysCanvas'), { ssr: false });
const CloudsOverlayCanvas = dynamic(() => import('@/components/canvas/effects/CloudsOverlayCanvas'), { ssr: false });
const ThunderCanvas = dynamic(() => import('@/components/canvas/effects/ThunderCanvas'), { ssr: false });
const SnowCanvas = dynamic(() => import('@/components/canvas/effects/SnowCanvas'), { ssr: false });
const NightGlowOverlay = dynamic(() => import('@/components/canvas/effects/NightGlowOverlay'), { ssr: false });

type WindowWithDataLayer = Window & {
    dataLayer?: {
        push?: (payload: { event: string }) => void;
    };
};

export default function WeatherEffectsOverlay({
    weatherOverride,
    includeRain = false,
}: {
    weatherOverride?: WeatherType;
    includeRain?: boolean;
} = {}) {
    const { season, seasonEvent, weather: storeWeather } = useStore();
    const weather = weatherOverride ?? storeWeather;
    const sunraysVariant = !weatherOverride && seasonEvent === 'geshi' && season === 'summer' && weather === 'Clear'
        ? 'geshi-clear'
        : season === 'summer' && weather === 'Clear'
        ? 'summer-clear'
        : season === 'spring' && weather === 'Clear'
            ? 'spring-clear'
            : season === 'autumn' && weather === 'Clear'
                ? 'autumn-clear'
                : 'default';
    const cloudsVariant = season === 'spring' && weather === 'Clouds' ? 'spring-clouds' : 'default';
    const nightVariant = season === 'autumn' && weather === 'Night' ? 'autumn-night' : 'default';
    const snowVariant = season === 'winter' && weather === 'Snow' ? 'winter-snow' : 'default';

    return (
        <>
            <AnimatePresence mode="wait">
                {(weather === 'Clear' || weather === 'Morning') && <SunraysCanvas key={`sunrays-${sunraysVariant}`} variant={sunraysVariant} />}
                {weather === 'Clouds' && <CloudsOverlayCanvas key={`clouds-${cloudsVariant}`} variant={cloudsVariant} />}
                {includeRain && weather === 'Rain' && <RainParticles key="rain" />}
                {weather === 'Thunder' && <RainParticles key="thunder-rain" />}
                {weather === 'Thunder' && <ThunderCanvas key="thunder" />}
                {weather === 'Snow' && <SnowCanvas key={`snow-${snowVariant}`} density={0.72} variant={snowVariant} />}
                {weather === 'Night' && <NightGlowOverlay key={`night-${nightVariant}`} variant={nightVariant} />}
            </AnimatePresence>

            {/* Sun / Moon overlay anchors: open X in a new tab. Position tuned to match canvases. */}
            {(weather === 'Clear' || weather === 'Morning') && (
                <a
                    href="https://x.com/0ts_st"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X を新しいタブで開く"
                    className="pointer-events-auto fixed right-[8%] top-[9%] w-12 h-12 z-50 rounded-full"
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => {
                        try {
                            (window as WindowWithDataLayer).dataLayer?.push?.({ event: 'click_x_from_sun' });
                        } catch { }
                    }}
                >
                    <span className="sr-only">X で開く</span>
                </a>
            )}

            {weather === 'Night' && (
                <a
                    href="https://x.com/0ts_st"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X を新しいタブで開く"
                    className="pointer-events-auto fixed right-[6.8%] top-[5.2%] w-24 h-24 z-50 rounded-full"
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => {
                        try {
                            (window as WindowWithDataLayer).dataLayer?.push?.({ event: 'click_x_from_moon' });
                        } catch { }
                    }}
                >
                    <span className="sr-only">X で開く</span>
                </a>
            )}
        </>
    );
}
