'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/store';
import { parseWorldStateParams, resolveWorldState } from '@/lib/worldState';
import type { WorldState } from '@/lib/worldStateTypes';
import { resolveSeasonState } from '@/lib/seasonResolver';

const WorldStateContext = createContext<WorldState | null>(null);

export default function WorldStateProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams();
    const searchParamsKey = searchParams.toString();
    const { storeWeather, storeSeason, storeSeasonEvent, setWorldState } = useStore((state) => ({
        storeWeather: state.weather,
        storeSeason: state.season,
        storeSeasonEvent: state.seasonEvent,
        setWorldState: state.setWorldState,
    }));
    const routeWorldState = useMemo(
        () => parseWorldStateParams(new URLSearchParams(searchParamsKey)),
        [searchParamsKey],
    );
    const fallbackSeasonState = useMemo(() => resolveSeasonState(), []);

    const worldState = useMemo(() => resolveWorldState(
        routeWorldState,
        {
            weather: storeWeather,
            season: storeSeason === 'none' ? fallbackSeasonState.season : storeSeason,
            seasonEvent: storeSeasonEvent === 'none' ? fallbackSeasonState.seasonEvent : storeSeasonEvent,
        },
    ), [fallbackSeasonState, routeWorldState, storeSeason, storeSeasonEvent, storeWeather]);

    useEffect(() => {
        const nextWorldState = {
            ...(routeWorldState.weather && routeWorldState.weather !== storeWeather ? { weather: routeWorldState.weather } : {}),
            ...(routeWorldState.season && routeWorldState.season !== storeSeason ? { season: routeWorldState.season } : {}),
            ...(routeWorldState.seasonEvent && routeWorldState.seasonEvent !== storeSeasonEvent ? { seasonEvent: routeWorldState.seasonEvent } : {}),
        };
        if (Object.keys(nextWorldState).length > 0) {
            setWorldState(nextWorldState);
        }
    }, [routeWorldState.season, routeWorldState.seasonEvent, routeWorldState.weather, setWorldState, storeSeason, storeSeasonEvent, storeWeather]);

    return (
        <WorldStateContext.Provider value={worldState}>
            {children}
        </WorldStateContext.Provider>
    );
}

export function useWorldState(): WorldState {
    const worldState = useContext(WorldStateContext);
    if (!worldState) {
        throw new Error('useWorldState must be used inside WorldStateProvider');
    }
    return worldState;
}
