import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.cwd();
await mkdir('tmp', { recursive: true });
const directory = await mkdtemp(path.join(root, 'tmp/cloudflare-check-'));
const relativeImport = target => './' + path.relative(directory, path.join(root, target)).replaceAll('\\', '/');
await writeFile(path.join(directory, 'probe.mjs'), `
import worker from ${JSON.stringify(relativeImport('.open-next/worker.js'))};
import { createProbe } from ${JSON.stringify(relativeImport('scripts/fixtures/cloudflare-probe.mjs'))};
export default createProbe(worker);
`);
const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
config.name = 'living-planet-validation';
config.main = path.join(directory, 'probe.mjs');
config.assets.directory = path.join(root, config.assets.directory);
delete config.$schema;
delete config.observability;
await writeFile(path.join(directory, 'wrangler.json'), JSON.stringify(config));
const port = 8788;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [
    'node_modules/wrangler/bin/wrangler.js', 'dev', '--local', '--ip', '127.0.0.1', '--port', String(port),
    '--inspector-port', '0', '--config', path.join(directory, 'wrangler.json'), '--persist-to', path.join(directory, 'state'),
], { cwd: root, env: { ...process.env, WRANGLER_SEND_METRICS: 'false' }, stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);
const results = { runtime: 'workerd', platform: process.platform };
const control = async command => {
    const response = await fetch(`${base}/__cloudflare_test`, command ? { method: 'POST', body: JSON.stringify(command) } : {});
    assert.equal(response.status, 200);
    return response.json();
};
async function poll(operation, predicate, timeout = 30_000) {
    const started = performance.now();
    while (performance.now() - started < timeout) {
        if (server.exitCode !== null) throw new Error(`workerd exited with ${server.exitCode}`);
        try { const value = await operation(); if (predicate(value)) return value; } catch { /* wait for startup or background writes */ }
        await delay(200);
    }
    throw new Error('Timed out waiting for the workerd assertion');
}
async function home() {
    const response = await fetch(`${base}/?lang=en`, { signal: AbortSignal.timeout(15_000) });
    assert.equal(response.status, 200);
    return response.text();
}
try {
    await poll(() => control(), () => true);
    assert.match(await home(), /data-world-weather="Rain"/);
    const cached = await poll(() => control(), data => data.entries.some(({ entry }) => entry.value?.kind === 'FETCH'));
    const weatherEntry = cached.entries.find(({ entry }) => entry.value?.kind === 'FETCH');
    assert.equal(weatherEntry.entry.value.revalidate, 1800);
    assert.equal(cached.upstreamCalls, 1);
    assert.match(await home(), /data-world-weather="Rain"/);
    assert.equal((await control()).upstreamCalls, 1, 'second HTML request must read KV instead of calling upstream');
    results.cache = { binding: 'NEXT_INC_CACHE_KV', revalidateSeconds: 1800, upstreamCallsForTwoRequests: 1 };

    await control({ mode: 'Snow', expire: true });
    await poll(home, html => /data-world-weather="Snow"/.test(html));
    assert.equal((await control()).upstreamCalls, 2, 'expired KV weather must be refreshed');
    results.staleRefresh = true;

    await control({ mode: 'blocked', clear: true });
    const started = performance.now();
    assert.match(await home(), /data-world-weather="Clear"/);
    results.timeoutFallbackMs = Math.round(performance.now() - started);
    assert.ok(results.timeoutFallbackMs < 4000, 'unresponsive weather service must not hang HTML rendering');

    await control({ mode: 'Rain', clear: true });
    const browser = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--reporter=line,json'], {
        cwd: root, env: { ...process.env, PLAYWRIGHT_BASE_URL: base, PLAYWRIGHT_JSON_OUTPUT_FILE: 'test-results/cloudflare-playwright.json' }, stdio: 'inherit',
    });
    const code = await new Promise((resolve, reject) => { browser.on('error', reject); browser.on('exit', resolve); });
    assert.equal(code, 0, 'browser tests against workerd must pass');
    results.browserTests = 'passed';
    console.log(JSON.stringify(results, null, 2));
} finally {
    await writeFile('tmp/cloudflare-runtime-results.json', JSON.stringify(results, null, 2));
    server.kill('SIGTERM');
}
