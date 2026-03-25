'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'resolved' | 'error';

export default function GeoLocationBadge() {
    const [status, setStatus] = useState<Status>('idle');
    const [label, setLabel] = useState('OSAKA BASED');

    const resolveLocation = async () => {
        if (!('geolocation' in navigator)) {
            setStatus('error');
            setLabel('LOCATION UNAVAILABLE');
            return;
        }

        setStatus('loading');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
                    const response = await fetch(endpoint, {
                        headers: {
                            Accept: 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error('reverse-geocode-failed');
                    }

                    const data = (await response.json()) as {
                        address?: {
                            city?: string;
                            town?: string;
                            village?: string;
                            state?: string;
                            country?: string;
                        };
                    };

                    const city = data.address?.city ?? data.address?.town ?? data.address?.village ?? data.address?.state;
                    const country = data.address?.country;

                    if (city && country) {
                        setLabel(`${city.toUpperCase()}, ${country.toUpperCase()}`);
                    } else if (city) {
                        setLabel(city.toUpperCase());
                    } else {
                        setLabel('LOCATION DETECTED');
                    }

                    setStatus('resolved');
                } catch {
                    setStatus('error');
                    setLabel('LOCATION DETECTED');
                }
            },
            () => {
                setStatus('error');
                setLabel('LOCATION OFF');
            },
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 600000,
            },
        );
    };

    return (
        <button
            type="button"
            onClick={resolveLocation}
            disabled={status === 'loading'}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-200 disabled:cursor-wait disabled:opacity-70"
            aria-live="polite"
        >
            {status === 'loading' ? 'LOCATING...' : label}
        </button>
    );
}
