import { create } from 'zustand';
import { normalizeWorldState, type WorldState } from '../lib/worldState';

export type { SeasonEventType, SeasonType, WeatherType } from '../lib/worldStateTypes';
import type { SeasonEventType, SeasonType, WeatherType } from '../lib/worldStateTypes';

interface AppState {
    weather: WeatherType;
    season: SeasonType;
    seasonEvent: SeasonEventType;
    seasonResolution: 'auto' | 'manual';
    seasonEventResolution: 'auto' | 'manual';
    githubActivityLevel: number;
    activeWorkId: string | null;
    transitionType: 'none' | 'warp' | 'cloud' | 'freeze' | 'rain' | 'snow' | 'sunburst' | 'flash' | 'heavy-cloud' | 'wave' | 'moonrise' | 'captcha-lock';
    setWeather: (weather: WeatherType) => void;
    setSeason: (season: SeasonType) => void;
    setSeasonEvent: (seasonEvent: SeasonEventType) => void;
    setWorldState: (state: Partial<WorldState>) => void;
    initializeWorldState: (state: Partial<WorldState>) => void;
    setActivity: (level: number) => void;
    setActiveWork: (id: string | null) => void;
    setTransitionType: (type: 'none' | 'warp' | 'cloud' | 'freeze' | 'rain' | 'snow' | 'sunburst' | 'flash' | 'heavy-cloud' | 'wave' | 'moonrise' | 'captcha-lock') => void;
}


export const useStore = create<AppState>((set) => ({
    weather: 'Clear',
    season: 'none',
    seasonEvent: 'none',
    seasonResolution: 'auto',
    seasonEventResolution: 'auto',
    githubActivityLevel: 0.5,
    activeWorkId: null,
    transitionType: 'none',
    setWeather: (weather) => set((current) => normalizeWorldState({
        weather,
        season: current.season,
        seasonEvent: current.seasonEvent,
    })),
    setSeason: (season) => set((current) => ({
        ...normalizeWorldState({
            weather: current.weather,
            season,
            seasonEvent: current.seasonEvent,
        }),
        seasonResolution: 'manual',
    })),
    setSeasonEvent: (seasonEvent) => set((current) => ({
        ...normalizeWorldState({
            weather: current.weather,
            season: current.season,
            seasonEvent,
        }),
        seasonEventResolution: 'manual',
    })),
    setWorldState: (next) => set((current) => ({
        ...normalizeWorldState({
            weather: next.weather ?? current.weather,
            season: next.season ?? current.season,
            seasonEvent: next.seasonEvent ?? current.seasonEvent,
        }),
        seasonResolution: next.season === undefined ? current.seasonResolution : 'manual',
        seasonEventResolution: next.seasonEvent === undefined ? current.seasonEventResolution : 'manual',
    })),
    initializeWorldState: (next) => set((current) => ({
        ...normalizeWorldState({
            weather: next.weather ?? current.weather,
            season: next.season ?? current.season,
            seasonEvent: next.seasonEvent ?? current.seasonEvent,
        }),
        // Server initialization is a fresh snapshot, not a manual override.
        // Route parameters can opt fields back into manual mode afterwards.
        seasonResolution: 'auto',
        seasonEventResolution: 'auto',
    })),
    setActivity: (level) => set({ githubActivityLevel: level }),
    setActiveWork: (id) => set({ activeWorkId: id }),
    setTransitionType: (type) => set({ transitionType: type }),
}));
