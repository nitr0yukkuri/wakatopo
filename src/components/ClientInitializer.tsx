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
    const { setWeather, setActivity, setActiveWork } = useStore();

    useEffect(() => {
        setWeather(initialWeather);
        setActivity(initialActivity);
        setActiveWork(null);
    }, [initialWeather, initialActivity, setWeather, setActivity, setActiveWork]);

    return null;
}