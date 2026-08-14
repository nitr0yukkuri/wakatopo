// src/components/ClientInitializer.tsx
'use client'

import { useEffect } from 'react';
import { useStore, WeatherType } from '@/store';

export default function ClientInitializer({
    initialWeather,
    initialActivity
}: {
    initialWeather: WeatherType;
    initialActivity: number;
}) {
    const { setWorldState, setActivity } = useStore();

    useEffect(() => {
        setWorldState({ weather: initialWeather });
        setActivity(initialActivity);
    }, [initialWeather, initialActivity, setWorldState, setActivity]);

    return null;
}
