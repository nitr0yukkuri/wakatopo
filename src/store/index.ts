import { create } from 'zustand';

export type WeatherType = 'Clear' | 'Rain' | 'Clouds' | 'Snow' | 'Night' | 'Morning' | 'Thunder';
export type SeasonType = 'none' | 'summer';

interface AppState {
    weather: WeatherType;
    season: SeasonType;
    githubActivityLevel: number;
    activeWorkId: string | null;
    transitionType: 'none' | 'warp' | 'cloud' | 'freeze' | 'rain' | 'snow' | 'sunburst' | 'flash' | 'heavy-cloud' | 'wave' | 'moonrise' | 'captcha-lock';
    setWeather: (weather: WeatherType) => void;
    setSeason: (season: SeasonType) => void;
    setActivity: (level: number) => void;
    setActiveWork: (id: string | null) => void;
    setTransitionType: (type: 'none' | 'warp' | 'cloud' | 'freeze' | 'rain' | 'snow' | 'sunburst' | 'flash' | 'heavy-cloud' | 'wave' | 'moonrise' | 'captcha-lock') => void;
}


export const useStore = create<AppState>((set) => ({
    weather: 'Clear',
    season: 'none',
    githubActivityLevel: 0.5,
    activeWorkId: null,
    transitionType: 'none',
    setWeather: (weather) => set({ weather }),
    setSeason: (season) => set({ season }),
    setActivity: (level) => set({ githubActivityLevel: level }),
    setActiveWork: (id) => set({ activeWorkId: id }),
    setTransitionType: (type) => set({ transitionType: type }),
}));
