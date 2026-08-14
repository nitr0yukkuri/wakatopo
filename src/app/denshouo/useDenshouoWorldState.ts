'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '@/store';
import { buildWorldStateQuery, canonicalizeWorldStateQuery } from '@/lib/worldState';
import { useWorldState } from '@/components/WorldStateProvider';

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
    const { setActiveWork } = useStore();
    const displayedWorldState = useWorldState();
    const { weather: displayedWeather, season: displayedSeason, seasonEvent: displayedSeasonEvent } = displayedWorldState;
    const hasRouteWorldState = ['weather', 'season', 'seasonEvent'].some((key) => searchParams.has(key));

    useEffect(() => {
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

        if (displayedWeather !== 'Rain') {
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
        router,
        searchParams,
    ]);

    return {
        lang,
        worldState: displayedWorldState,
        setActiveWork,
    };
}
