import { describe, expect, it } from 'vitest';
import { hasExclusiveBgm, resolveAudioWorkId } from './soundProfile';

describe('sound profile routing', () => {
    it('resolves page routes before the stored active work', () => {
        expect(resolveAudioWorkId('/otenkigurashi', '03')).toBe('02');
        expect(resolveAudioWorkId('/denshouo', '02')).toBe('05');
        expect(resolveAudioWorkId('/', '03')).toBe('03');
    });

    it('marks only exclusive work BGM as exclusive', () => {
        expect(hasExclusiveBgm('02')).toBe(true);
        expect(hasExclusiveBgm('05')).toBe(true);
        expect(hasExclusiveBgm('03')).toBe(false);
        expect(hasExclusiveBgm(null)).toBe(false);
    });
});
