'use client';
import dynamic from 'next/dynamic';
import { useStore, type WeatherType } from '@/store';
import { usePathname, useSearchParams } from 'next/navigation';
import { parseWorldStateParams, resolveWorldState } from '@/lib/worldState';
import { getWorldVisualProfile } from '@/lib/worldVisualProfile';

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
    snowMobileScale = 1,
}: {
    weatherOverride?: WeatherType;
    includeRain?: boolean;
    snowMobileScale?: number;
} = {}) {
    const { season, seasonEvent, weather: storeWeather } = useStore();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const routeWorldState = pathname === '/' || pathname === '/otenkigurashi'
        ? parseWorldStateParams(searchParams)
        : {};
    const worldState = resolveWorldState(routeWorldState, {
        weather: storeWeather,
        season,
        seasonEvent,
    });
    const weather = weatherOverride ?? worldState.weather;
    const visualProfile = getWorldVisualProfile(
        { ...worldState, weather },
        { includeGeshiSun: !weatherOverride },
    );
    const { sunraysVariant, cloudsVariant, nightVariant, snowVariant } = visualProfile;

    return (
        <>
            {(weather === 'Clear' || weather === 'Morning') && <SunraysCanvas key={`sunrays-${sunraysVariant}`} variant={sunraysVariant} />}
            {weather === 'Clouds' && <CloudsOverlayCanvas key={`clouds-${cloudsVariant}`} variant={cloudsVariant} />}
            {includeRain && weather === 'Rain' && <RainParticles key="rain" />}
            {weather === 'Thunder' && <RainParticles key="thunder-rain" />}
            {weather === 'Thunder' && <ThunderCanvas key="thunder" />}
            {weather === 'Snow' && <SnowCanvas key={`snow-${snowVariant}`} density={0.72} variant={snowVariant} mobileScale={snowMobileScale} />}
            {weather === 'Night' && <NightGlowOverlay key={`night-${nightVariant}`} variant={nightVariant} />}

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
