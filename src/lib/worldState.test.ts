import { describe, expect, it } from 'vitest';
import { parseWorldStateRecord } from './worldState';

describe('parseWorldStateRecord', () => {
    it('clears tsuyu when the route explicitly selects a non-summer season', () => {
        expect(parseWorldStateRecord({ season: 'autumn', seasonEvent: 'tsuyu' })).toEqual({
            season: 'autumn',
            seasonEvent: 'none',
        });
    });

    it('keeps tsuyu for an explicitly selected summer route', () => {
        expect(parseWorldStateRecord({ season: 'summer', seasonEvent: 'tsuyu' })).toEqual({
            season: 'summer',
            seasonEvent: 'tsuyu',
        });
    });
});
