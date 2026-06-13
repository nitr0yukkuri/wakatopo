'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

export default function DelayedAnalytics({ measurementId }: { measurementId: string }) {
    useEffect(() => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;

        let timeoutId: number | null = null;
        let idleId: number | null = null;

        const loadAnalytics = () => {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function gtag(...args: unknown[]) {
                window.dataLayer.push(args);
            };
            window.gtag('js', new Date());
            window.gtag('config', measurementId, { page_path: window.location.pathname });
        };

        const scheduleAnalytics = () => {
            timeoutId = window.setTimeout(loadAnalytics, 5000);
        };

        if ('requestIdleCallback' in window) {
            idleId = window.requestIdleCallback(scheduleAnalytics, { timeout: 3000 });
        } else {
            scheduleAnalytics();
        }

        return () => {
            if (idleId !== null) window.cancelIdleCallback(idleId);
            if (timeoutId !== null) window.clearTimeout(timeoutId);
        };
    }, [measurementId]);

    return null;
}
