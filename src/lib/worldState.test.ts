import { describe, expect, it } from 'vitest';
import { canonicalizeWorldStateQuery, parseWorldStateParams, parseWorldStateRecord, resolveWorldState } from './worldState';

describe('parseWorldStateRecord', () => {
    it('clears tsuyu when the route explicitly selects a non-summer season', () => {
        expect(parseWorldStateRecord({ season: 'autumn', seasonEvent: 'tsuyu' })).toEqual({
            season: 'autumn',
            seasonEvent: 'none',
        });
    });

    it('clears tsuyu when the route explicitly selects spring', () => {
        expect(parseWorldStateRecord({ season: 'spring', seasonEvent: 'tsuyu' })).toEqual({
            season: 'spring',
            seasonEvent: 'none',
        });
    });

    it('keeps tsuyu for an explicitly selected summer route', () => {
        expect(parseWorldStateRecord({ season: 'summer', seasonEvent: 'tsuyu' })).toEqual({
            season: 'summer',
            seasonEvent: 'tsuyu',
        });
    });

    it('normalizes an event against the fallback season when the route omits season', () => {
        expect(resolveWorldState(
            { seasonEvent: 'tsuyu' },
            { weather: 'Rain', season: 'autumn', seasonEvent: 'none' },
        )).toEqual({
            weather: 'Rain',
            season: 'autumn',
            seasonEvent: 'none',
        });
    });

    it('keeps a valid summer tsuyu combination when combining route and store state', () => {
        expect(resolveWorldState(
            { season: 'summer', seasonEvent: 'tsuyu' },
            { weather: 'Clouds', season: 'none', seasonEvent: 'none' },
        )).toEqual({
            weather: 'Clouds',
            season: 'summer',
            seasonEvent: 'tsuyu',
        });
    });

    it('clears geshi when the season or weather is incompatible', () => {
        expect(resolveWorldState(
            { season: 'autumn', weather: 'Clear', seasonEvent: 'geshi' },
            { weather: 'Clear', season: 'none', seasonEvent: 'none' },
        ).seasonEvent).toBe('none');

        expect(resolveWorldState(
            { season: 'summer', weather: 'Rain', seasonEvent: 'geshi' },
            { weather: 'Clear', season: 'none', seasonEvent: 'none' },
        ).seasonEvent).toBe('none');
    });

    it('clears tsuyu when the weather leaves its supported set', () => {
        expect(resolveWorldState(
            { season: 'summer', weather: 'Snow', seasonEvent: 'tsuyu' },
            { weather: 'Clear', season: 'none', seasonEvent: 'none' },
        ).seasonEvent).toBe('none');

        expect(resolveWorldState(
            { season: 'summer', weather: 'Clouds', seasonEvent: 'tsuyu' },
            { weather: 'Clear', season: 'none', seasonEvent: 'none' },
        ).seasonEvent).toBe('tsuyu');
    });

    it('allows first light only during the Morning weather state', () => {
        expect(resolveWorldState(
            { season: 'winter', seasonEvent: 'first_light', weather: 'Rain' },
            { weather: 'Clear', season: 'none', seasonEvent: 'none' },
        ).seasonEvent).toBe('none');

        expect(resolveWorldState(
            { season: 'winter', seasonEvent: 'first_light', weather: 'Morning' },
            { weather: 'Clear', season: 'none', seasonEvent: 'none' },
        ).seasonEvent).toBe('first_light');
    });

    it('turns an explicitly invalid URL event into none', () => {
        expect(parseWorldStateParams(new URLSearchParams('weather=Rain&season=summer&seasonEvent=unknown'))).toEqual({
            weather: 'Rain',
            season: 'summer',
            seasonEvent: 'none',
        });
    });

    it('canonicalizes a partial URL into one resolved snapshot', () => {
        const query = canonicalizeWorldStateQuery(
            new URLSearchParams('lang=ja&weather=Snow'),
            { weather: 'Snow', season: 'winter', seasonEvent: 'first_light' },
        );

        expect(query.toString()).toBe('lang=ja&weather=Snow&season=winter&seasonEvent=none');
    });
});
