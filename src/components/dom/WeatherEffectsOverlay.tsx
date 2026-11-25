'use client';
import type { WeatherType } from '@/lib/worldStateTypes';
import { useWorldState } from '@/components/WorldStateProvider';
import WeatherEffectsVisual from './WeatherEffectsVisual';

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
    const worldState = useWorldState();
    const weather = weatherOverride ?? worldState.weather;
    return (
        <>
            <WeatherEffectsVisual
                world={{ ...worldState, weather }}
                includeRain={includeRain}
                snowMobileScale={snowMobileScale}
                includeGeshiSun={!weatherOverride}
            />

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
