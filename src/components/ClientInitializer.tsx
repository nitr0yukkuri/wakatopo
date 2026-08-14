'use client'

import { useEffect } from 'react';
import { useStore, type SeasonEventType, type SeasonType, type WeatherType } from '@/store';

export default function ClientInitializer({
    initialWeather,
    initialSeason,
    initialSeasonEvent,
    initialActivity
}: {
    initialWeather: WeatherType;
    initialSeason?: SeasonType;
    initialSeasonEvent?: SeasonEventType;
    initialActivity: number;
}) {
    const { setWeather, setSeason, setSeasonEvent, setActivity, setActiveWork } = useStore();

    useEffect(() => {
        setWeather(initialWeather);
        if (initialSeason) setSeason(initialSeason);
        if (initialSeasonEvent) setSeasonEvent(initialSeasonEvent);
        setActivity(initialActivity);
        setActiveWork(null);
    }, [initialActivity, initialSeason, initialSeasonEvent, initialWeather, setActiveWork, setActivity, setSeason, setSeasonEvent, setWeather]);

    return null;
}
