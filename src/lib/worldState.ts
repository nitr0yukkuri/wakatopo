import type { SeasonEventType, SeasonType, WeatherType, WorldState } from './worldStateTypes';

export type { SeasonEventType, SeasonType, WeatherType, WorldState } from './worldStateTypes';

export const VALID_WEATHERS: WeatherType[] = ['Clear', 'Rain', 'Clouds', 'Snow', 'Night', 'Morning', 'Thunder'];
export const VALID_SEASONS: SeasonType[] = ['none', 'spring', 'summer', 'autumn', 'winter'];
export const VALID_SEASON_EVENTS: SeasonEventType[] = ['none', 'geshi', 'tsuyu', 'first_light'];

export const DEFAULT_WORLD_STATE: WorldState = {
    weather: 'Clear',
    season: 'none',
    seasonEvent: 'none',
};

type SeasonEventRule = {
    season: SeasonType;
    weather: readonly WeatherType[];
};

export const SEASON_EVENT_RULES: Record<Exclude<SeasonEventType, 'none'>, SeasonEventRule> = {
    geshi: { season: 'summer', weather: ['Clear', 'Morning'] },
    tsuyu: { season: 'summer', weather: ['Clear', 'Morning', 'Clouds', 'Rain'] },
    first_light: { season: 'winter', weather: ['Morning'] },
};

export function isSeasonEventAllowed(
    season: SeasonType | undefined,
    seasonEvent: SeasonEventType,
    weather?: WeatherType,
): boolean {
    if (seasonEvent === 'none') return true;

    const rule = SEASON_EVENT_RULES[seasonEvent];
    if (!rule) return false;
    if (season !== undefined && season !== rule.season) return false;
    if (weather !== undefined && !rule.weather.includes(weather)) return false;
    return true;
}

export function normalizeSeasonEvent(
    season: SeasonType | undefined,
    seasonEvent: SeasonEventType,
    weather?: WeatherType,
): SeasonEventType {
    return isSeasonEventAllowed(season, seasonEvent, weather) ? seasonEvent : 'none';
}

/**
 * Apply the cross-field rules that cannot be expressed by the individual
 * unions above. Keeping this in one place prevents the URL, transition layer,
 * and page components from disagreeing about the active seasonal event.
 */
export function normalizeWorldState(state: WorldState): WorldState {
    const normalizedSeasonEvent = normalizeSeasonEvent(state.season, state.seasonEvent, state.weather);
    return {
        ...state,
        seasonEvent: normalizedSeasonEvent,
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
    const resolvedState = normalizeWorldState(state);
    // A route that opts into world state must carry one complete snapshot.
    // Keeping partial query strings allows omitted seasonal fields to leak
    // back in from the Zustand store on the next navigation.
    params.set('weather', resolvedState.weather);
    params.set('season', resolvedState.season);
    params.set('seasonEvent', resolvedState.seasonEvent);
    return params;
}

type SearchValue = string | string[] | undefined | null;
type SearchRecord = Record<string, SearchValue>;
type SearchParamsLike = {
    get: (name: string) => string | null;
    has?: (name: string) => boolean;
};

const firstValue = (value: SearchValue) => Array.isArray(value) ? value[0] : value ?? null;

export function parseWorldStateRecord(source: SearchRecord): Partial<WorldState> {
    const weather = firstValue(source.weather);
    const season = firstValue(source.season);
    const seasonEvent = firstValue(source.seasonEvent);
    const parsedSeason = season && VALID_SEASONS.includes(season as SeasonType) ? season as SeasonType : null;
    const parsedSeasonEvent = seasonEvent && VALID_SEASON_EVENTS.includes(seasonEvent as SeasonEventType)
        ? seasonEvent as SeasonEventType
        : null;
    const parsedWeather = weather && VALID_WEATHERS.includes(weather as WeatherType)
        ? weather as WeatherType
        : null;
    const hasSeasonEvent = seasonEvent !== undefined && seasonEvent !== null;
    const normalizedSeasonEvent = hasSeasonEvent
        ? normalizeSeasonEvent(parsedSeason ?? undefined, parsedSeasonEvent ?? 'none', parsedWeather ?? undefined)
        : null;

    return {
        ...(parsedWeather ? { weather: parsedWeather } : {}),
        ...(parsedSeason ? { season: parsedSeason } : {}),
        ...(normalizedSeasonEvent ? { seasonEvent: normalizedSeasonEvent } : {}),
    };
}

export function parseWorldStateParams(source: SearchParamsLike): Partial<WorldState> {
    return parseWorldStateRecord({
        weather: source.get('weather'),
        season: source.get('season'),
        // Preserve an explicitly supplied invalid event as `none` instead of
        // allowing a stale event from the Zustand fallback to leak into the URL state.
        seasonEvent: source.has?.('seasonEvent') ? source.get('seasonEvent') : undefined,
    });
}

export function buildWorldStateQuery(state: WorldState, lang?: string) {
    const resolvedState = normalizeWorldState(state);
    const params = new URLSearchParams();
    if (lang) params.set('lang', lang);
    params.set('weather', resolvedState.weather);
    params.set('season', resolvedState.season);
    params.set('seasonEvent', resolvedState.seasonEvent);
    return params.toString();
}
