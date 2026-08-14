import type { SeasonEventType, SeasonType, WeatherType } from '@/store';

export const VALID_WEATHERS: WeatherType[] = ['Clear', 'Rain', 'Clouds', 'Snow', 'Night', 'Morning', 'Thunder'];
export const VALID_SEASONS: SeasonType[] = ['none', 'spring', 'summer', 'autumn', 'winter'];
export const VALID_SEASON_EVENTS: SeasonEventType[] = ['none', 'geshi', 'tsuyu', 'first_light'];

export type WorldState = {
    weather: WeatherType;
    season: SeasonType;
    seasonEvent: SeasonEventType;
};

export const DEFAULT_WORLD_STATE: WorldState = {
    weather: 'Clear',
    season: 'none',
    seasonEvent: 'none',
};

export function normalizeSeasonEvent(season: SeasonType, seasonEvent: SeasonEventType): SeasonEventType {
    if (seasonEvent === 'tsuyu' && season !== 'summer') return 'none';
    if (seasonEvent === 'first_light' && season !== 'winter') return 'none';
    return seasonEvent;
}

/**
 * Apply the cross-field rules that cannot be expressed by the individual
 * unions above. Keeping this in one place prevents the URL, transition layer,
 * and page components from disagreeing about the active seasonal event.
 */
export function normalizeWorldState(state: WorldState): WorldState {
    const normalizedSeasonEvent = normalizeSeasonEvent(state.season, state.seasonEvent);
    return {
        ...state,
        seasonEvent: normalizedSeasonEvent === 'first_light'
            && (state.season !== 'winter' || state.weather !== 'Morning')
            ? 'none'
            : normalizedSeasonEvent,
    };
}

export function resolveWorldState(partial: Partial<WorldState>, fallback: WorldState = DEFAULT_WORLD_STATE): WorldState {
    return normalizeWorldState({
        weather: partial.weather ?? fallback.weather,
        season: partial.season ?? fallback.season,
        seasonEvent: partial.seasonEvent ?? fallback.seasonEvent,
    });
}

export function canonicalizeWorldStateQuery(source: URLSearchParams, state: WorldState) {
    const params = new URLSearchParams(source.toString());
    if (params.has('weather')) params.set('weather', state.weather);
    if (params.has('season')) params.set('season', state.season);
    if (params.has('seasonEvent')) params.set('seasonEvent', state.seasonEvent);
    return params;
}

type SearchValue = string | string[] | undefined | null;
type SearchRecord = Record<string, SearchValue>;
type SearchParamsLike = { get: (name: string) => string | null };

const firstValue = (value: SearchValue) => Array.isArray(value) ? value[0] : value ?? null;

export function parseWorldStateRecord(source: SearchRecord): Partial<WorldState> {
    const weather = firstValue(source.weather);
    const season = firstValue(source.season);
    const seasonEvent = firstValue(source.seasonEvent);
    const parsedSeason = season && VALID_SEASONS.includes(season as SeasonType) ? season as SeasonType : null;
    const parsedSeasonEvent = seasonEvent && VALID_SEASON_EVENTS.includes(seasonEvent as SeasonEventType)
        ? seasonEvent as SeasonEventType
        : null;
    const normalizedSeasonEvent = parsedSeason && parsedSeasonEvent
        ? normalizeSeasonEvent(parsedSeason, parsedSeasonEvent)
        : parsedSeasonEvent;

    return {
        ...(weather && VALID_WEATHERS.includes(weather as WeatherType) ? { weather: weather as WeatherType } : {}),
        ...(parsedSeason ? { season: parsedSeason } : {}),
        ...(normalizedSeasonEvent ? { seasonEvent: normalizedSeasonEvent } : {}),
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
