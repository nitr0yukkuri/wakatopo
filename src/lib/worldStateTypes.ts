export type WeatherType = 'Clear' | 'Rain' | 'Clouds' | 'Snow' | 'Night' | 'Morning' | 'Thunder';
export type SeasonType = 'none' | 'spring' | 'summer' | 'autumn' | 'winter';
export type SeasonEventType = 'none' | 'geshi' | 'tsuyu' | 'first_light' | 'birthday';

export type WorldState = {
    weather: WeatherType;
    season: SeasonType;
    seasonEvent: SeasonEventType;
};
