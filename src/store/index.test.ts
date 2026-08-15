import { afterEach, describe, expect, it } from 'vitest';
import { useStore } from './index';

const DEFAULT_STATE = { weather: 'Clear' as const, season: 'none' as const, seasonEvent: 'none' as const };

afterEach(() => {
    useStore.setState({
        ...DEFAULT_STATE,
        seasonResolution: 'auto',
        seasonEventResolution: 'auto',
    });
});

describe('world state store', () => {
    it('updates the world atomically and clears an incompatible event', () => {
        useStore.getState().setWorldState({
            weather: 'Rain',
            season: 'autumn',
            seasonEvent: 'tsuyu',
        });

        expect(useStore.getState()).toMatchObject({
            weather: 'Rain',
            season: 'autumn',
            seasonEvent: 'none',
        });
    });

    it('keeps first light only for a winter morning', () => {
        useStore.getState().setWorldState({
            weather: 'Morning',
            season: 'winter',
            seasonEvent: 'first_light',
        });

        expect(useStore.getState().seasonEvent).toBe('first_light');

        useStore.getState().setWorldState({ weather: 'Rain' });
        expect(useStore.getState().seasonEvent).toBe('none');
    });

    it('clears an incompatible seasonal event when only weather changes', () => {
        useStore.getState().setWorldState({
            weather: 'Rain',
            season: 'summer',
            seasonEvent: 'tsuyu',
        });

        useStore.getState().setWeather('Snow');

        expect(useStore.getState()).toMatchObject({
            weather: 'Snow',
            season: 'summer',
            seasonEvent: 'none',
        });
    });

    it('keeps an explicit season clear separate from automatic resolution', () => {
        useStore.getState().setWorldState({ season: 'none', seasonEvent: 'none' });

        expect(useStore.getState()).toMatchObject({
            season: 'none',
            seasonEvent: 'none',
            seasonResolution: 'manual',
            seasonEventResolution: 'manual',
        });
    });

    it('does not turn server initialization into a manual override', () => {
        useStore.getState().initializeWorldState({ season: 'winter' });

        expect(useStore.getState()).toMatchObject({
            season: 'winter',
            seasonResolution: 'auto',
        });
    });
});
