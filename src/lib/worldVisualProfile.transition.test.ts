import { describe, expect, it } from 'vitest';
import { getWorldVisualProfile } from './worldVisualProfile';
import type { WorldState } from './worldState';

const snapshots: WorldState[] = [
    { weather: 'Morning', season: 'winter', seasonEvent: 'first_light' },
    { weather: 'Rain', season: 'summer', seasonEvent: 'tsuyu' },
    { weather: 'Clear', season: 'autumn', seasonEvent: 'none' },
    { weather: 'Snow', season: 'winter', seasonEvent: 'none' },
];

describe('transition/final visual state contract', () => {
    it('derives one profile for both transition and final consumers', () => {
        for (const snapshot of snapshots) {
            const transitionProfile = getWorldVisualProfile(snapshot);
            const finalProfile = getWorldVisualProfile({ ...snapshot });

            expect(finalProfile).toEqual(transitionProfile);
        }
    });

    it('does not expose an event visual when the snapshot is illegal', () => {
        const profile = getWorldVisualProfile({ weather: 'Snow', season: 'summer', seasonEvent: 'tsuyu' });

        expect(profile.showTsuyu).toBe(false);
        expect(profile.showFirstLight).toBe(false);
        expect(profile.showGeshi).toBe(false);
    });
});
