import { create } from 'zustand';

export type WeatherType = 'Clear' | 'Rain' | 'Clouds' | 'Night';

interface AppState {
    weather: WeatherType;
    githubActivityLevel: number;
    setWeather: (weather: WeatherType) => void;
    setActivity: (level: number) => void;
}

export const useStore = create<AppState>((set) => ({
    weather: 'Clear',
    githubActivityLevel: 0.5,
    setWeather: (weather) => set({ weather }),
    setActivity: (level) => set({ githubActivityLevel: level }),
}));