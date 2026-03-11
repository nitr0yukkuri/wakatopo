import { create } from 'zustand';

export type WeatherType = 'Clear' | 'Rain' | 'Clouds' | 'Snow' | 'Night';

interface AppState {
    weather: WeatherType;
    githubActivityLevel: number;
    activeWorkId: string | null;
    transitionType: 'none' | 'warp' | 'cloud' | 'freeze' | 'rain' | 'snow';
    setWeather: (weather: WeatherType) => void;
    setActivity: (level: number) => void;
    setActiveWork: (id: string | null) => void;
    setTransitionType: (type: 'none' | 'warp' | 'cloud' | 'freeze' | 'rain' | 'snow') => void;
}

export const useStore = create<AppState>((set) => ({
    weather: 'Clear',
    githubActivityLevel: 0.5,
    activeWorkId: null,
    transitionType: 'none',
    setWeather: (weather) => set({ weather }),
    setActivity: (level) => set({ githubActivityLevel: level }),
    setActiveWork: (id) => set({ activeWorkId: id }),
    setTransitionType: (type) => set({ transitionType: type }),
}));