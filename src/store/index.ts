import { create } from 'zustand';

export type WeatherType = 'Clear' | 'Rain' | 'Clouds' | 'Night';

interface AppState {
    weather: WeatherType;
    githubActivityLevel: number;
    activeWorkId: string | null;
    setWeather: (weather: WeatherType) => void;
    setActivity: (level: number) => void;
    setActiveWork: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
    weather: 'Clear',
    githubActivityLevel: 0.5,
    activeWorkId: null,
    setWeather: (weather) => set({ weather }),
    setActivity: (level) => set({ githubActivityLevel: level }),
    setActiveWork: (id) => set({ activeWorkId: id }),
}));