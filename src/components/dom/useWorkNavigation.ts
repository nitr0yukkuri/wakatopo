'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { buildWorldStateQuery } from '@/lib/worldState';
import { type TransitionType } from '@/lib/soundProfile';
import { useStore } from '@/store';

type WorkId = '01' | '02' | '03' | '04' | '05';

type NavigationPlan = {
    path: string;
    transition: Exclude<TransitionType, 'none'>;
    routeDelay: number;
    clearDelay: number;
};

const STATIC_PLANS: Record<Exclude<WorkId, '02' | '05'>, Omit<NavigationPlan, 'path'>> = {
    '01': { transition: 'warp', routeDelay: 1400, clearDelay: 1000 },
    '03': { transition: 'freeze', routeDelay: 2000, clearDelay: 1000 },
    '04': { transition: 'captcha-lock', routeDelay: 1650, clearDelay: 900 },
};

export function useWorkNavigation(lang: 'ja' | 'en') {
    const router = useRouter();
    const setActiveWork = useStore((state) => state.setActiveWork);
    const setTransitionType = useStore((state) => state.setTransitionType);
    const timersRef = useRef<number[]>([]);
    const navigationVersionRef = useRef(0);

    const clearTimers = useCallback(() => {
        timersRef.current.forEach((timer) => window.clearTimeout(timer));
        timersRef.current = [];
        navigationVersionRef.current += 1;
    }, []);

    useEffect(() => clearTimers, [clearTimers]);

    const navigateToWork = useCallback((workId: string) => {
        if (!isWorkId(workId)) return false;

        const currentState = useStore.getState();
        const plan = getNavigationPlan(workId, lang, currentState);
        if (!plan) return false;

        clearTimers();
        const navigationVersion = navigationVersionRef.current;
        setActiveWork(workId);
        setTransitionType(plan.transition);

        const routeTimer = window.setTimeout(() => {
            router.push(plan.path);

            const clearTimer = window.setTimeout(() => {
                // A newer navigation may already own the overlay. Never clear it
                // from an older route's timer.
                if (
                    navigationVersionRef.current === navigationVersion
                    && useStore.getState().transitionType === plan.transition
                ) {
                    setTransitionType('none');
                }
            }, plan.clearDelay);
            timersRef.current.push(clearTimer);
        }, plan.routeDelay);

        timersRef.current.push(routeTimer);
        return true;
    }, [clearTimers, lang, router, setActiveWork, setTransitionType]);

    return navigateToWork;
}

function isWorkId(value: string): value is WorkId {
    return value === '01' || value === '02' || value === '03' || value === '04' || value === '05';
}

function getNavigationPlan(
    workId: WorkId,
    lang: 'ja' | 'en',
    state: ReturnType<typeof useStore.getState>,
): NavigationPlan | null {
    if (workId === '02') {
        const transition = state.weather === 'Rain'
            ? 'rain'
            : state.weather === 'Snow'
                ? 'snow'
                : state.weather === 'Thunder'
                    ? 'flash'
                    : state.weather === 'Clouds'
                        ? 'heavy-cloud'
                        : state.weather === 'Clear' || state.weather === 'Morning'
                            ? 'sunburst'
                            : 'moonrise';

        return {
            path: `/otenkigurashi?${buildWorldStateQuery({ weather: state.weather, season: state.season, seasonEvent: state.seasonEvent }, lang)}`,
            transition,
            routeDelay: 2000,
            clearDelay: 1000,
        };
    }

    if (workId === '05') {
        return {
            path: `/denshouo?${buildWorldStateQuery({ weather: state.weather, season: state.season, seasonEvent: state.seasonEvent }, lang)}`,
            transition: 'wave',
            routeDelay: 1800,
            clearDelay: 900,
        };
    }

    const staticPlan = STATIC_PLANS[workId];
    const paths: Record<Exclude<WorkId, '02' | '05'>, string> = {
        '01': `/github-planet?lang=${lang}`,
        '03': `/coldkeep?lang=${lang}`,
        '04': `/recaptcha-game?lang=${lang}`,
    };

    return { path: paths[workId], ...staticPlan };
}
