import { afterEach, describe, expect, it } from 'vitest';
import { useStore } from './index';

const DEFAULT_STATE = { weather: 'Clear' as const, season: 'none' as const, seasonEvent: 'none' as const };

afterEach(() => {
    useStore.getState().setWorldState(DEFAULT_STATE);
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
});
