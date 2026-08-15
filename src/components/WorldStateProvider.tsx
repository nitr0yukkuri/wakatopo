'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store';
import { canonicalizeWorldStateQuery, parseWorldStateParams, resolveWorldState } from '@/lib/worldState';
import type { WorldState } from '@/lib/worldStateTypes';
import { resolveSeasonState } from '@/lib/seasonResolver';

const WorldStateContext = createContext<WorldState | null>(null);

export default function WorldStateProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams();
    const searchParamsKey = searchParams.toString();
    const pathname = usePathname();
    const router = useRouter();
    const storeWeather = useStore((state) => state.weather);
    const storeSeason = useStore((state) => state.season);
    const storeSeasonEvent = useStore((state) => state.seasonEvent);
    const seasonResolution = useStore((state) => state.seasonResolution);
    const seasonEventResolution = useStore((state) => state.seasonEventResolution);
    const setWorldState = useStore((state) => state.setWorldState);
    const routeWorldState = useMemo(
        () => parseWorldStateParams(new URLSearchParams(searchParamsKey)),
        [searchParamsKey],
    );
    const [seasonClockKey, setSeasonClockKey] = useState(() => getJapanDayKey());

    useEffect(() => {
        const timer = window.setInterval(() => {
            const nextKey = getJapanDayKey();
            setSeasonClockKey((currentKey) => currentKey === nextKey ? currentKey : nextKey);
        }, 60_000);
        return () => window.clearInterval(timer);
    }, []);

    const fallbackSeasonState = useMemo(
        () => resolveSeasonState(new Date(`${seasonClockKey}T00:00:00+09:00`)),
        [seasonClockKey],
    );

    const worldState = useMemo(() => resolveWorldState(
        routeWorldState,
        {
            weather: storeWeather,
            season: seasonResolution === 'auto' ? fallbackSeasonState.season : storeSeason,
            seasonEvent: seasonEventResolution === 'auto' ? fallbackSeasonState.seasonEvent : storeSeasonEvent,
        },
    ), [fallbackSeasonState, routeWorldState, seasonEventResolution, seasonResolution, storeSeason, storeSeasonEvent, storeWeather]);

    useEffect(() => {
        const nextWorldState = {
            ...(routeWorldState.weather ? { weather: routeWorldState.weather } : {}),
            ...(routeWorldState.season ? { season: routeWorldState.season } : {}),
            ...(routeWorldState.seasonEvent ? { seasonEvent: routeWorldState.seasonEvent } : {}),
        };
        if (Object.keys(nextWorldState).length > 0) {
            setWorldState(nextWorldState);
        }
    }, [routeWorldState.season, routeWorldState.seasonEvent, routeWorldState.weather, setWorldState]);

    useEffect(() => {
        const currentParams = new URLSearchParams(searchParamsKey);
        const hasRouteWorldState = ['weather', 'season', 'seasonEvent'].some((key) => currentParams.has(key));
        if (!hasRouteWorldState) return;

        const canonicalQuery = canonicalizeWorldStateQuery(
            currentParams,
            worldState,
        ).toString();
        if (canonicalQuery !== searchParamsKey) {
            router.replace(`${pathname}?${canonicalQuery}`, { scroll: false });
        }
    }, [pathname, router, searchParamsKey, worldState]);

    return (
        <WorldStateContext.Provider value={worldState}>
            {children}
        </WorldStateContext.Provider>
    );
}

function getJapanDayKey() {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}

export function useWorldState(): WorldState {
    const worldState = useContext(WorldStateContext);
    if (!worldState) {
        throw new Error('useWorldState must be used inside WorldStateProvider');
    }
    return worldState;
}
