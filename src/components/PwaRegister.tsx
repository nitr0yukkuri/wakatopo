'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const register = () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Ignore registration errors to keep UI stable.
            });
        };
        const scheduleRegister = () => {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(register, { timeout: 3000 });
                return;
            }

            globalThis.setTimeout(register, 1500);
        };

        window.addEventListener('load', scheduleRegister, { once: true });
        return () => window.removeEventListener('load', scheduleRegister);
    }, []);

    return null;
}
