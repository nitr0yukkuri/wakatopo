import { describe, expect, it } from 'vitest';
import { AUTUMN_LEAF_SPECS, SPRING_PETAL_SPECS } from './otenkigurashiSeasonal';

describe('seasonal visual tokens', () => {
    it('keeps deterministic spring particle specs in one shared stream', () => {
        expect(SPRING_PETAL_SPECS).toHaveLength(24);
        expect(SPRING_PETAL_SPECS[0]).toEqual({
            left: expect.any(Number),
            delay: expect.any(Number),
            duration: expect.any(Number),
            size: expect.any(Number),
            drift: expect.any(Number),
            rotate: expect.any(Number),
        });
        expect(SPRING_PETAL_SPECS.every((petal) => petal.duration >= 12 && petal.duration < 19)).toBe(true);
    });

    it('keeps autumn leaf specs available as the shared transition contract', () => {
        expect(AUTUMN_LEAF_SPECS).toHaveLength(20);
        expect(AUTUMN_LEAF_SPECS.every((leaf) => leaf.duration >= 9 && leaf.duration < 16)).toBe(true);
    });
});
