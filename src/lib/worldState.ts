import type { SeasonEventType, SeasonType, WeatherType } from '@/store';

export const VALID_WEATHERS: WeatherType[] = ['Clear', 'Rain', 'Clouds', 'Snow', 'Night', 'Morning', 'Thunder'];
export const VALID_SEASONS: SeasonType[] = ['none', 'spring', 'summer', 'autumn', 'winter'];
export const VALID_SEASON_EVENTS: SeasonEventType[] = ['none', 'geshi', 'tsuyu'];

export type WorldState = {
    weather: WeatherType;
    season: SeasonType;
    seasonEvent: SeasonEventType;
};

type SearchValue = string | string[] | undefined | null;
type SearchRecord = Record<string, SearchValue>;
type SearchParamsLike = { get: (name: string) => string | null };

const firstValue = (value: SearchValue) => Array.isArray(value) ? value[0] : value ?? null;

export function parseWorldStateRecord(source: SearchRecord): Partial<WorldState> {
    const weather = firstValue(source.weather);
    const season = firstValue(source.season);
    const seasonEvent = firstValue(source.seasonEvent);

    return {
        ...(weather && VALID_WEATHERS.includes(weather as WeatherType) ? { weather: weather as WeatherType } : {}),
        ...(season && VALID_SEASONS.includes(season as SeasonType) ? { season: season as SeasonType } : {}),
        ...(seasonEvent && VALID_SEASON_EVENTS.includes(seasonEvent as SeasonEventType)
            ? { seasonEvent: seasonEvent as SeasonEventType }
            : {}),
    };
}

export function parseWorldStateParams(source: SearchParamsLike): Partial<WorldState> {
    return parseWorldStateRecord({
        weather: source.get('weather'),
        season: source.get('season'),
        seasonEvent: source.get('seasonEvent'),
    });
}

export function buildWorldStateQuery(state: WorldState, lang?: string) {
    const params = new URLSearchParams();
    if (lang) params.set('lang', lang);
    params.set('weather', state.weather);
    params.set('season', state.season);
    params.set('seasonEvent', state.seasonEvent);
    return params.toString();
}
