import { describe, expect, it } from 'vitest';
import { resolveSeasonState } from './seasonResolver';

const japanDate = (date: string) => new Date(`${date}T03:00:00.000Z`);

describe('resolveSeasonState', () => {
    it('resolves first light on New Year morning', () => {
        expect(resolveSeasonState(japanDate('2026-01-01'))).toEqual({
            season: 'winter',
            seasonEvent: 'first_light',
        });
    });

    it('resolves the regular season boundaries', () => {
        expect(resolveSeasonState(japanDate('2026-03-01'))).toEqual({ season: 'spring', seasonEvent: 'none' });
        expect(resolveSeasonState(japanDate('2026-06-06'))).toEqual({ season: 'summer', seasonEvent: 'none' });
        expect(resolveSeasonState(japanDate('2026-06-07')).season).toBe('summer');
        expect(resolveSeasonState(japanDate('2026-09-01'))).toEqual({ season: 'autumn', seasonEvent: 'none' });
        expect(resolveSeasonState(japanDate('2026-12-01'))).toEqual({ season: 'winter', seasonEvent: 'none' });
    });

    it('gives geshi precedence over the tsuyu atmosphere on the solstice', () => {
        expect(resolveSeasonState(japanDate('2026-06-21'))).toEqual({ season: 'summer', seasonEvent: 'geshi' });
    });

    it('keeps tsuyu inside its intended date range', () => {
        expect(resolveSeasonState(japanDate('2026-06-20')).seasonEvent).toBe('tsuyu');
        expect(resolveSeasonState(japanDate('2026-07-20')).seasonEvent).toBe('tsuyu');
        expect(resolveSeasonState(japanDate('2026-07-21')).seasonEvent).toBe('none');
    });
});
