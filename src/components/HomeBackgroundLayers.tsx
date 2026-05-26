'use client';

import { useEffect } from 'react';
import SceneClient from '@/components/canvas/SceneClient';
import WeatherEffectsOverlay from '@/components/dom/WeatherEffectsOverlay';

export default function HomeBackgroundLayers() {
    useEffect(() => {
        // Only run diagnostics when the app is running as a PWA (standalone)
        try {
            const isPwa = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
                || (navigator as any).standalone === true;

            if (!isPwa) return;

            // Gather useful debugging info for scroll issues
            const bodyOverflow = document.body.style.overflow;
            const bodyTouch = document.body.style.touchAction;
            const htmlOverflow = document.documentElement.style.overflow;

            // Find potentially blocking fixed/absolute elements
            const els = Array.from(document.querySelectorAll<HTMLElement>('*'))
                .filter((el) => {
                    try {
                        const s = window.getComputedStyle(el);
                        return (s.position === 'fixed' || s.position === 'absolute') && parseInt(s.zIndex || '0', 10) >= 10;
                    } catch {
                        return false;
                    }
                })
                .map((el) => ({
                    tag: el.tagName,
                    z: window.getComputedStyle(el).zIndex || '',
                    pos: window.getComputedStyle(el).position || '',
                    rect: el.getBoundingClientRect(),
                }));

            const xAnchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="x.com/0ts_st"]'))
                .map((a) => ({ href: a.href, rect: a.getBoundingClientRect(), pointerEvents: window.getComputedStyle(a).pointerEvents }));

            // Log a clear diagnostic snapshot for remote debugging
            // eslint-disable-next-line no-console
            console.groupCollapsed('[PWA DEBUG] HomeBackgroundLayers scroll diagnostics');
            // eslint-disable-next-line no-console
            console.log('document.body.style.overflow:', bodyOverflow);
            // eslint-disable-next-line no-console
            console.log('document.body.style.touchAction:', bodyTouch);
            // eslint-disable-next-line no-console
            console.log('document.documentElement.style.overflow:', htmlOverflow);
            // eslint-disable-next-line no-console
            console.log('Fixed/Absolute elements (z>=10):', els);
            // eslint-disable-next-line no-console
            console.log('X anchors:', xAnchors);
            // eslint-disable-next-line no-console
            console.groupEnd();
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('PWA diagnostic failed', e);
        }
    }, []);

    return (
        <>
            <div className="fixed inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none lg:pointer-events-auto">
                <SceneClient />
            </div>
            <WeatherEffectsOverlay />
        </>
    );
}
