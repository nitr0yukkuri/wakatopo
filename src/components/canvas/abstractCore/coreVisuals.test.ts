import { describe, expect, it } from 'vitest';
import { getCoreVisualProfile } from './coreVisuals';

describe('getCoreVisualProfile', () => {
    it('keeps first light as a winter Morning-only visual profile', () => {
        const firstLight = getCoreVisualProfile('Morning', 'winter', 'first_light');
        const snow = getCoreVisualProfile('Snow', 'winter', 'first_light');

        expect(firstLight.baseColor).toBe('#e9a568');
        expect(snow.baseColor).toBe('#c9eeff');
    });

    it('uses the same seasonal profile for Morning as for the corresponding clear scene', () => {
        expect(getCoreVisualProfile('Morning', 'spring')).toEqual(getCoreVisualProfile('Clear', 'spring'));
        expect(getCoreVisualProfile('Morning', 'summer')).toEqual(getCoreVisualProfile('Clear', 'summer'));
        expect(getCoreVisualProfile('Morning', 'autumn')).toEqual(getCoreVisualProfile('Clear', 'autumn'));
    });
});
