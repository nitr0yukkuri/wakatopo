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
    const { setWeather, setActivity } = useStore();

    useEffect(() => {
        setWeather(initialWeather);
        setActivity(initialActivity);
    }, [initialWeather, initialActivity, setWeather, setActivity]);

    return null;
}