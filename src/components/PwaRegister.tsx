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

        window.addEventListener('load', register, { once: true });
        return () => window.removeEventListener('load', register);
    }, []);

    return null;
}
