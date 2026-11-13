// Test-only wrapper around the actual built portfolio Worker. The production
// Wrangler entrypoint never imports this file or exposes these control routes.
export function createProbe(worker) {
    const NativeDate = Date;
    function FixedDate(...args) {
        if (!new.target) return new NativeDate('2026-11-13T04:00:00Z').toString();
        return Reflect.construct(NativeDate, args.length ? args : ['2026-11-13T04:00:00Z'], new.target);
    }
    // Keep own now/parse/UTC descriptors so Next can install its normal Date
    // tracking extension. Date.now stays real for cache expiration checks.
    globalThis.Date = Object.defineProperties(FixedDate, Object.getOwnPropertyDescriptors(NativeDate));
    const originalFetch = globalThis.fetch;
    let mode = 'Rain';
    let upstreamCalls = 0;
    globalThis.fetch = (input, init) => {
        const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
        if (url.hostname !== 'api.open-meteo.com') return originalFetch(input, init);
        upstreamCalls++;
        if (mode === 'blocked') {
            const signal = init?.signal ?? input.signal;
            return new Promise((_resolve, reject) => {
                if (signal.aborted) reject(signal.reason);
                else signal.addEventListener('abort', () => reject(signal.reason), { once: true });
            });
        }
        return Promise.resolve(Response.json({ current: { weather_code: mode === 'Snow' ? 71 : 61 } }));
    };
    return {
        ...worker,
        async fetch(request, env, ctx) {
            if (new URL(request.url).pathname !== '/__cloudflare_test') return worker.fetch(request, env, ctx);
            const kv = env.NEXT_INC_CACHE_KV;
            if (request.method === 'POST') {
                const command = await request.json();
                if (command.mode) mode = command.mode;
                for (const { name } of (await kv.list()).keys) {
                    if (command.clear) await kv.delete(name);
                    else if (command.expire) {
                        const value = await kv.get(name, 'json');
                        value.lastModified = Date.now() - 1_801_000;
                        await kv.put(name, JSON.stringify(value));
                    }
                }
            }
            const entries = [];
            for (const { name } of (await kv.list()).keys) entries.push({ name, entry: await kv.get(name, 'json') });
            return Response.json({ mode, upstreamCalls, entries });
        },
    };
}
