import { create } from 'zustand';
import { normalizeWorldState, type WorldState } from '../lib/worldState';

export type WeatherType = 'Clear' | 'Rain' | 'Clouds' | 'Snow' | 'Night' | 'Morning' | 'Thunder';
export type SeasonType = 'none' | 'spring' | 'summer' | 'autumn' | 'winter';
export type SeasonEventType = 'none' | 'geshi' | 'tsuyu' | 'first_light';

interface AppState {
    weather: WeatherType;
    season: SeasonType;
    seasonEvent: SeasonEventType;
    githubActivityLevel: number;
    activeWorkId: string | null;
    transitionType: 'none' | 'warp' | 'cloud' | 'freeze' | 'rain' | 'snow' | 'sunburst' | 'flash' | 'heavy-cloud' | 'wave' | 'moonrise' | 'captcha-lock';
    setWeather: (weather: WeatherType) => void;
    setSeason: (season: SeasonType) => void;
    setSeasonEvent: (seasonEvent: SeasonEventType) => void;
    setWorldState: (state: Partial<WorldState>) => void;
    setActivity: (level: number) => void;
    setActiveWork: (id: string | null) => void;
    setTransitionType: (type: 'none' | 'warp' | 'cloud' | 'freeze' | 'rain' | 'snow' | 'sunburst' | 'flash' | 'heavy-cloud' | 'wave' | 'moonrise' | 'captcha-lock') => void;
}


export const useStore = create<AppState>((set) => ({
    weather: 'Clear',
    season: 'none',
    seasonEvent: 'none',
    githubActivityLevel: 0.5,
    activeWorkId: null,
    transitionType: 'none',
    setWeather: (weather) => set((current) => normalizeWorldState({
        weather,
        season: current.season,
        seasonEvent: current.seasonEvent,
    })),
    setSeason: (season) => set((current) => normalizeWorldState({
        weather: current.weather,
        season,
        seasonEvent: current.seasonEvent,
    })),
    setSeasonEvent: (seasonEvent) => set((current) => normalizeWorldState({
        weather: current.weather,
        season: current.season,
        seasonEvent,
    })),
    setWorldState: (next) => set((current) => normalizeWorldState({
        weather: next.weather ?? current.weather,
        season: next.season ?? current.season,
        seasonEvent: next.seasonEvent ?? current.seasonEvent,
    })),
    setActivity: (level) => set({ githubActivityLevel: level }),
    setActiveWork: (id) => set({ activeWorkId: id }),
    setTransitionType: (type) => set({ transitionType: type }),
}));
