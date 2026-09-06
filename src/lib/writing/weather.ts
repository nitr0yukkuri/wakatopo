import type { WritingWeather } from './theme';

export function mapOpenMeteoCode(code: number): WritingWeather {
    if (code === 0 || code === 1) return 'clear';
    if (code === 2 || code === 3 || (code >= 45 && code <= 48)) return 'cloudy';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
    if (code >= 95) return 'rain';
    return 'unavailable';
}

export async function getWritingWeather(): Promise<WritingWeather> {
    try {
        const response = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=34.6937&longitude=135.5023&current=weather_code',
            { next: { revalidate: 1800 } },
        );
        if (!response.ok) return 'unavailable';
        const data = await response.json() as { current?: { weather_code?: number } };
        const code = data.current?.weather_code;
        return typeof code === 'number' ? mapOpenMeteoCode(code) : 'unavailable';
    } catch {
        return 'unavailable';
    }
}
