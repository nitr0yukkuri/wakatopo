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

    it('selects first light only for the winter Morning snapshot', () => {
        const morning = getWorldVisualProfile({ weather: 'Morning', season: 'winter', seasonEvent: 'first_light' });
        const snow = getWorldVisualProfile({ weather: 'Snow', season: 'winter', seasonEvent: 'first_light' });

        expect(morning.showFirstLight).toBe(true);
        expect(morning.sunraysVariant).toBe('first-light');
        expect(snow.showFirstLight).toBe(false);
        expect(snow.sunraysVariant).toBe('default');
    });

    it('uses the seasonal clear profile for Morning across screens', () => {
        expect(getWorldVisualProfile({ weather: 'Morning', season: 'spring', seasonEvent: 'none' }).showSpring).toBe(true);
        expect(getWorldVisualProfile({ weather: 'Morning', season: 'summer', seasonEvent: 'none' }).showSummer).toBe(true);
        expect(getWorldVisualProfile({ weather: 'Morning', season: 'autumn', seasonEvent: 'none' }).showAutumn).toBe(true);
    });
});
