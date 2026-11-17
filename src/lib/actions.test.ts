import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPlanetData } from './actions';

describe('planet weather fetch', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-11-13T04:00:00Z')); // 13:00 JST
    });
    afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

    it('caches a valid upstream response for 30 minutes', async () => {
        const fetchMock = vi.fn().mockResolvedValue(Response.json({ current: { weather_code: 71 } }));
        vi.stubGlobal('fetch', fetchMock);
        expect((await fetchPlanetData()).weather).toBe('Snow');
        expect(fetchMock.mock.calls[0][1].next.revalidate).toBe(1800);
    });

    it('aborts an unresponsive upstream and uses the daytime fallback', async () => {
        vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
            options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
        })));
        const started = performance.now();
        expect((await fetchPlanetData()).weather).toBe('Clear');
        expect(performance.now() - started).toBeLessThan(3500);
    });

    it.each([{}, { current: {} }, { current: { weather_code: '71' } }])('falls back for malformed weather data: %j', async data => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(data)));
        expect((await fetchPlanetData()).weather).toBe('Clear');
    });

    it('falls back on HTTP failure and keeps the morning presentation', async () => {
        vi.setSystemTime(new Date('2026-11-12T22:00:00Z')); // 07:00 JST
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
        expect((await fetchPlanetData()).weather).toBe('Morning');
    });

    it('does not wait on the weather service at night', async () => {
        vi.setSystemTime(new Date('2026-11-13T14:00:00Z')); // 23:00 JST
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        expect((await fetchPlanetData()).weather).toBe('Night');
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
