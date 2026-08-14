'use client'

import { useEffect, useLayoutEffect } from 'react';
import { useStore, type SeasonEventType, type SeasonType, type WeatherType } from '@/store';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

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
    const { setWorldState, setActivity, setActiveWork } = useStore();

    useIsomorphicLayoutEffect(() => {
        setWorldState({
            weather: initialWeather,
            ...(initialSeason ? { season: initialSeason } : {}),
            ...(initialSeasonEvent ? { seasonEvent: initialSeasonEvent } : {}),
        });
        setActivity(initialActivity);
        setActiveWork(null);
    }, [initialActivity, initialSeason, initialSeasonEvent, initialWeather, setActiveWork, setActivity, setWorldState]);

    return null;
}
