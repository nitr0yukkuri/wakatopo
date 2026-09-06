export const WRITING_TIME_BANDS = [
    'dawn',
    'morning',
    'daytime',
    'evening',
    'night',
    'late-night',
] as const;

export type WritingTimeBand = (typeof WRITING_TIME_BANDS)[number];

export const WRITING_WEATHERS = [
    'clear',
    'cloudy',
    'rain',
    'snow',
    'unavailable',
] as const;

export type WritingWeather = (typeof WRITING_WEATHERS)[number];

export type WritingTheme = {
    background: string;
    surface: string;
    text: string;
    secondary: string;
    border: string;
    accent: string;
};

const THEMES: Record<WritingTimeBand, WritingTheme> = {
    dawn: {
        background: '#111827',
        surface: 'rgba(31, 41, 55, 0.72)',
        text: '#f5f7fb',
        secondary: '#c7d2e3',
        border: 'rgba(191, 219, 254, 0.26)',
        accent: '#f6c98d',
    },
    morning: {
        background: '#162235',
        surface: 'rgba(30,  fifty,  seventy, 0.72)'.replace('fifty', '50').replace('seventy', '70'),
        text: '#f8fbff',
        secondary: '#c7d6e9',
        border: 'rgba(186, 230, 253, 0.26)',
        accent: '#8fd8ff',
    },
    daytime: {
        background: '#18212a',
        surface: 'rgba(35, 48, 60, 0.76)',
        text: '#f8fafc',
        secondary: '#cbd5e1',
        border: 'rgba(186, 230, 253, 0.23)',
        accent: '#67e8f9',
    },
    evening: {
        background: '#211d2b',
        surface: 'rgba(52, 43, 67, 0.78)',
        text: '#fff8f1',
        secondary: '#decfd0',
        border: 'rgba(251, 191, 160, 0.25)',
        accent: '#f5b68a',
    },
    night: {
        background: '#090d18',
        surface: 'rgba(16, 24, 40, 0.80)',
        text: '#f1f5f9',
        secondary: '#a9b7cd',
        border: 'rgba(125, 211, 252, 0.22)',
        accent: '#8ad7ff',
    },
    'late-night': {
        background: '#05070d',
        surface: 'rgba(11, 16, 28, 0.84)',
        text: '#e5edf7',
        secondary: '#98a8bf',
        border: 'rgba(148, 163, 184, 0.2)',
        accent: '#a7c7ff',
    },
};

const WEATHER_WASH: Record<WritingWeather, string> = {
    clear: 'rgba(125, 211, 252, 0.10)',
    cloudy: 'rgba(148, 163, 184, 0.14)',
    rain: 'rgba(59, 130, 246, 0.18)',
    snow: 'rgba(219, 234, 254, 0.18)',
    unavailable: 'rgba(148, 163, 184, 0.08)',
};

export function getWritingTimeBand(date: Date) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tokyo',
        hour: 'numeric',
        hour12: false,
    }).formatToParts(date);
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);

    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 17) return 'daytime';
    if (hour >= 17 && hour < 19) return 'evening';
    if (hour >= 19 && hour < 24) return 'night';
    return 'late-night';
}

export function getWritingTheme(timeBand: WritingTimeBand) {
    return THEMES[timeBand];
}

export function getWritingWeatherWash(weather: WritingWeather) {
    return WEATHER_WASH[weather];
}

export function parseWritingTimeBand(value: string | null | undefined) {
    return WRITING_TIME_BANDS.includes(value as WritingTimeBand) ? value as WritingTimeBand : null;
}

export function parseWritingWeather(value: string | null | undefined) {
    return WRITING_WEATHERS.includes(value as WritingWeather) ? value as WritingWeather : null;
}

export function getWritingWeatherLabel(weather: WritingWeather) {
    return {
        clear: 'CLEAR',
        cloudy: 'CLOUDY',
        rain: 'RAIN',
        snow: 'SNOW',
        unavailable: 'UNAVAILABLE',
    }[weather];
}

export function formatWritingTime(date: Date) {
    return new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}
