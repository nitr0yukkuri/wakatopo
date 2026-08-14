'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '@/store';
import {
    buildWorldStateQuery,
    canonicalizeWorldStateQuery,
    parseWorldStateParams,
    resolveWorldState,
} from '@/lib/worldState';

export type DenshouoLang = 'ja' | 'en';

/**
 * Keeps Denshouo's URL and shared world state in sync.
 * The page renders from one resolved snapshot so the visual layer and the
 * return-to-home link cannot observe different season/event combinations.
 */
export function useDenshouoWorldState() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang: DenshouoLang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const { setActiveWork, setWorldState, season, seasonEvent, weather } = useStore();
    const routeWorldState = parseWorldStateParams(searchParams);
    const displayedWorldState = resolveWorldState(routeWorldState, { weather, season, seasonEvent });
    const { weather: displayedWeather, season: displayedSeason, seasonEvent: displayedSeasonEvent } = displayedWorldState;
    const hasRouteWorldState = ['weather', 'season', 'seasonEvent'].some((key) => searchParams.has(key));

    useEffect(() => {
        const nextWorldState = {
            ...(weather !== displayedWeather && routeWorldState.weather ? { weather: displayedWeather } : {}),
            ...(season !== displayedSeason && routeWorldState.season ? { season: displayedSeason } : {}),
            ...(seasonEvent !== displayedSeasonEvent && routeWorldState.seasonEvent ? { seasonEvent: displayedSeasonEvent } : {}),
        };
        if (Object.keys(nextWorldState).length > 0) {
            setWorldState(nextWorldState);
        }

        const currentQuery = searchParams.toString();
        if (hasRouteWorldState) {
            const canonicalQuery = canonicalizeWorldStateQuery(searchParams, {
                weather: displayedWeather,
                season: displayedSeason,
                seasonEvent: displayedSeasonEvent,
            }).toString();
            if (canonicalQuery !== currentQuery) {
                router.replace(`/denshouo?${canonicalQuery}`, { scroll: false });
            }
            return;
        }

        if (weather !== 'Rain') {
            router.replace(`/denshouo?${buildWorldStateQuery({
                weather: displayedWeather,
                season: displayedSeason,
                seasonEvent: displayedSeasonEvent,
            }, lang)}`, { scroll: false });
        }
    }, [
        displayedSeason,
        displayedSeasonEvent,
        displayedWeather,
        hasRouteWorldState,
        lang,
        routeWorldState.season,
        routeWorldState.seasonEvent,
        routeWorldState.weather,
        router,
        searchParams,
        season,
        seasonEvent,
        setWorldState,
        weather,
    ]);

    return {
        lang,
        worldState: displayedWorldState,
        setActiveWork,
    };
}
