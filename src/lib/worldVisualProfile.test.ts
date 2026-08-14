import { describe, expect, it } from 'vitest';
import { getWorldVisualProfile } from './worldVisualProfile';

describe('getWorldVisualProfile', () => {
    it('keeps autumn leaves off during rain', () => {
        const profile = getWorldVisualProfile({ weather: 'Rain', season: 'autumn', seasonEvent: 'none' });

        expect(profile.showAutumn).toBe(false);
        expect(profile.showTsuyu).toBe(false);
    });

    it('uses the summer tsuyu atmosphere only for supported weather', () => {
        const rainProfile = getWorldVisualProfile({ weather: 'Rain', season: 'summer', seasonEvent: 'tsuyu' });
        const snowProfile = getWorldVisualProfile({ weather: 'Snow', season: 'summer', seasonEvent: 'tsuyu' });

        expect(rainProfile.showTsuyu).toBe(true);
        expect(rainProfile.showSummer).toBe(false);
        expect(snowProfile.showTsuyu).toBe(false);
    });

    it('selects the cloudy spring profile without adding clear-weather petals', () => {
        const profile = getWorldVisualProfile({ weather: 'Clouds', season: 'spring', seasonEvent: 'none' });

        expect(profile.showFlowerCloudy).toBe(true);
        expect(profile.showSpring).toBe(false);
        expect(profile.cloudsVariant).toBe('spring-clouds');
    });
});
