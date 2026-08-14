import type { WorldState } from './worldState';

export type WorldVisualProfile = WorldState & {
    isClear: boolean;
    isGeshiEvent: boolean;
    showTsuyu: boolean;
    showSpring: boolean;
    showFlowerCloudy: boolean;
    showGeshi: boolean;
    showSummer: boolean;
    showAutumn: boolean;
    showWinterSnow: boolean;
    sunraysVariant: 'geshi-clear' | 'summer-clear' | 'spring-clear' | 'autumn-clear' | 'default';
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
    const showTsuyu = season === 'summer'
        && seasonEvent === 'tsuyu'
        && (isClear || weather === 'Clouds' || weather === 'Rain');
    const showSpring = season === 'spring' && isClear && !showTsuyu;
    const showFlowerCloudy = season === 'spring' && weather === 'Clouds' && !showTsuyu;
    const showGeshi = isGeshiEvent && isClear;
    const showSummer = season === 'summer' && isClear && !showGeshi && !showTsuyu;
    const showAutumn = season === 'autumn' && isClear && !showTsuyu;
    const showWinterSnow = season === 'winter' && weather === 'Snow' && !showTsuyu;
    const includeGeshiSun = options.includeGeshiSun !== false;

    const sunraysVariant = !includeGeshiSun
        ? season === 'summer' && weather === 'Clear'
            ? 'summer-clear'
            : season === 'spring' && weather === 'Clear'
                ? 'spring-clear'
                : season === 'autumn' && weather === 'Clear'
                    ? 'autumn-clear'
                    : 'default'
        : isGeshiEvent && weather === 'Clear'
            ? 'geshi-clear'
            : season === 'summer' && weather === 'Clear'
                ? 'summer-clear'
                : season === 'spring' && weather === 'Clear'
                    ? 'spring-clear'
                    : season === 'autumn' && weather === 'Clear'
                        ? 'autumn-clear'
                        : 'default';

    return {
        weather,
        season,
        seasonEvent,
        isClear,
        isGeshiEvent,
        showTsuyu,
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
