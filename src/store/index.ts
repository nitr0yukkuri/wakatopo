import { create } from 'zustand';

export type WeatherType = 'Clear' | 'Rain' | 'Clouds' | 'Snow' | 'Night' | 'Morning' | 'Thunder';
export type SeasonType = 'none' | 'spring' | 'summer' | 'autumn' | 'winter';
export type SeasonEventType = 'none' | 'geshi' | 'tsuyu';

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
    setWeather: (weather) => set({ weather }),
    setSeason: (season) => set({ season }),
    setSeasonEvent: (seasonEvent) => set({ seasonEvent }),
    setActivity: (level) => set({ githubActivityLevel: level }),
    setActiveWork: (id) => set({ activeWorkId: id }),
    setTransitionType: (type) => set({ transitionType: type }),
}));
