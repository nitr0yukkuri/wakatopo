'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { RainParticles } from '@/components/canvas/RainTransitionCanvas';

const SunraysCanvas = dynamic(() => import('@/components/canvas/effects/SunraysCanvas'), { ssr: false });
const CloudsOverlayCanvas = dynamic(() => import('@/components/canvas/effects/CloudsOverlayCanvas'), { ssr: false });
const ThunderCanvas = dynamic(() => import('@/components/canvas/effects/ThunderCanvas'), { ssr: false });
const SnowCanvas = dynamic(() => import('@/components/canvas/effects/SnowCanvas'), { ssr: false });
const NightGlowOverlay = dynamic(() => import('@/components/canvas/effects/NightGlowOverlay'), { ssr: false });

export default function WeatherEffectsOverlay() {
    const { weather } = useStore();

    return (
        <>
            <AnimatePresence mode="wait">
                {(weather === 'Clear' || weather === 'Morning') && <SunraysCanvas key="sunrays" />}
                {weather === 'Clouds' && <CloudsOverlayCanvas key="clouds" />}
                {weather === 'Thunder' && <RainParticles key="thunder-rain" />}
                {weather === 'Thunder' && <ThunderCanvas key="thunder" />}
                {weather === 'Snow' && <SnowCanvas key="snow" density={0.72} />}
                {weather === 'Night' && <NightGlowOverlay key="night" />}
            </AnimatePresence>

            {/* Sun / Moon overlay anchors: open X in a new tab. Position tuned to match canvases. */}
            {(weather === 'Clear' || weather === 'Morning') && (
                <a
                    href="https://x.com/0ts_st"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X を新しいタブで開く"
                    className="pointer-events-auto fixed right-[8%] top-[9%] w-24 h-24 z-50 rounded-full"
                    onClick={() => {
                        try {
                            (window as any).dataLayer?.push?.({ event: 'click_x_from_sun' });
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
                    className="pointer-events-auto fixed right-[6.8%] top-[5.2%] w-[162px] h-[162px] z-50 rounded-full"
                    onClick={() => {
                        try {
                            (window as any).dataLayer?.push?.({ event: 'click_x_from_moon' });
                        } catch { }
                    }}
                >
                    <span className="sr-only">X で開く</span>
                </a>
            )}
        </>
    );
}
