import { isSeasonEventAllowed, type WorldState } from './worldState';

export type WorldVisualProfile = WorldState & {
    isClear: boolean;
    isGeshiEvent: boolean;
    showTsuyu: boolean;
    showFirstLight: boolean;
    showBirthday: boolean;
    showSpring: boolean;
    showFlowerCloudy: boolean;
    showGeshi: boolean;
    showSummer: boolean;
    showAutumn: boolean;
    showWinterSnow: boolean;
    sunraysVariant: 'geshi-clear' | 'summer-clear' | 'spring-clear' | 'autumn-clear' | 'first-light' | 'default';
    cloudsVariant: 'spring-clouds' | 'default';
    nightVariant: 'autumn-night' | 'default';
    snowVariant: 'winter-snow' | 'default';
};

type VisualProfileOptions = {
    includeGeshiSun?: boolean;
};

export function getWorldVisualProfile(
    worldState: WorldState,
    options: VisualProfileOptions = {},
): WorldVisualProfile {
    const { weather, season, seasonEvent } = worldState;
    const isClear = weather === 'Clear' || weather === 'Morning';
    const isGeshiEvent = season === 'summer' && seasonEvent === 'geshi';
    const showTsuyu = isSeasonEventAllowed(season, seasonEvent, weather) && seasonEvent === 'tsuyu';
    const showFirstLight = isSeasonEventAllowed(season, seasonEvent, weather) && seasonEvent === 'first_light';
    const showBirthday = isSeasonEventAllowed(season, seasonEvent, weather) && seasonEvent === 'birthday';
    const showSpring = season === 'spring' && isClear && !showTsuyu;
    const showFlowerCloudy = season === 'spring' && weather === 'Clouds' && !showTsuyu;
    const showGeshi = isSeasonEventAllowed(season, seasonEvent, weather) && isGeshiEvent && isClear;
    const showSummer = season === 'summer' && isClear && !showGeshi && !showTsuyu;
    const showAutumn = season === 'autumn' && isClear && !showTsuyu;
    const showWinterSnow = season === 'winter' && weather === 'Snow' && !showTsuyu;
    const includeGeshiSun = options.includeGeshiSun !== false;

    const sunraysVariant = showFirstLight || showBirthday
        ? 'first-light'
        : !includeGeshiSun
        ? season === 'summer' && isClear
            ? 'summer-clear'
            : season === 'spring' && isClear
                ? 'spring-clear'
                : season === 'autumn' && isClear
                    ? 'autumn-clear'
                    : 'default'
        : showGeshi
            ? 'geshi-clear'
            : season === 'summer' && isClear
                ? 'summer-clear'
                : season === 'spring' && isClear
                    ? 'spring-clear'
                    : season === 'autumn' && isClear
                        ? 'autumn-clear'
                        : 'default';

    return {
        weather,
        season,
        seasonEvent,
        isClear,
        isGeshiEvent,
        showTsuyu,
        showFirstLight,
        showBirthday,
        showSpring,
        showFlowerCloudy,
        showGeshi,
        showSummer,
        showAutumn,
        showWinterSnow,
        sunraysVariant,
        cloudsVariant: season === 'spring' && weather === 'Clouds' ? 'spring-clouds' : 'default',
        nightVariant: season === 'autumn' && weather === 'Night' ? 'autumn-night' : 'default',
        snowVariant: season === 'winter' && weather === 'Snow' ? 'winter-snow' : 'default',
    };
}
