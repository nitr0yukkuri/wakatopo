import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.argv[2] || 'http://127.0.0.1:3011';
const output = process.argv[3] || 'tmp/seo-performance';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
const browserVersion = browser.version();
const results = [];
try {
    for (const mobile of [false, true]) {
        const samples = ['/', '/', '/', '/github-planet', ...(mobile ? ['/coldkeep', '/about'] : [])];
        for (const [index, path] of samples.entries()) {
            const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1365, height: 900 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, serviceWorkers: 'block' });
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            const cdp = await context.newCDPSession(page);
            await cdp.send('Network.enable');
            await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: mobile ? 4 : 1 });
            if (mobile) await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750 });
            await page.addInitScript(() => {
                window.__seoMetrics = { lcp: null, shifts: [], events: [], longTasks: [] };
                for (const [type, handler] of [
                    ['largest-contentful-paint', entry => { window.__seoMetrics.lcp = { ms: entry.startTime, element: entry.element?.tagName, text: entry.element?.textContent?.slice(0, 100), url: entry.url }; }],
                    ['layout-shift', entry => { if (!entry.hadRecentInput) window.__seoMetrics.shifts.push({ time: entry.startTime, value: entry.value, sources: entry.sources?.map(source => ({ tag: source.node?.nodeName, className: source.node?.className, text: source.node?.textContent?.slice(0, 80) })) }); }],
                    ['event', entry => { if (entry.interactionId) window.__seoMetrics.events.push({ name: entry.name, duration: entry.duration, interactionId: entry.interactionId }); }],
                    ['longtask', entry => window.__seoMetrics.longTasks.push(entry.duration)],
                ]) {
                    try { new PerformanceObserver(list => list.getEntries().forEach(handler)).observe({ type, buffered: true, ...(type === 'event' ? { durationThreshold: 16 } : {}) }); } catch { /* unsupported metric */ }
                }
            });
            try {
                const response = await page.goto(new URL(`${path}?lang=ja&weather=Clear&season=autumn&seasonEvent=none`, base).href, { waitUntil: 'domcontentloaded', timeout: 90000 });
                await page.waitForTimeout(12000);
                if (index === 0 || path !== '/') await page.screenshot({ path: `${output}/${mobile ? 'mobile' : 'desktop'}-${path.replaceAll('/', '') || 'home'}.png` });
                // Measure one specific normal interaction, not the explicit audio start button.
                // This lab event latency is not a real-user, full-session INP value.
                const control = page.getByRole('button', { name: 'WAKATO // PORTFOLIO', exact: true });
                if (path === '/') {
                    await control.click({ timeout: 5000 });
                    await page.waitForFunction(() => document.querySelector('button[aria-controls="top-left-menu-panel"]')?.getAttribute('aria-expanded') === 'true');
                }
                await page.waitForTimeout(500);
                const metrics = await page.evaluate(() => {
                    const data = window.__seoMetrics;
                    let cls = 0, sum = 0, start = 0, previous = 0;
                    for (const shift of data.shifts) {
                        if (shift.time - previous > 1000 || shift.time - start > 5000) { sum = 0; start = shift.time; }
                        sum += shift.value; previous = shift.time; cls = Math.max(cls, sum);
                    }
                    const nav = performance.getEntriesByType('navigation')[0];
                    const resources = performance.getEntriesByType('resource');
                    return { ...data, cls, ttfbMs: nav.responseStart - nav.requestStart, resourceCount: resources.length, transferBytes: resources.reduce((n, e) => n + e.transferSize, 0), maxObservedInteractionMs: data.events.length ? Math.max(...data.events.map(e => e.duration)) : null, canvasCount: document.querySelectorAll('canvas').length };
                });
                const item = { path, profile: mobile ? 'mobile-4x-1.6Mbps-150ms' : 'desktop-unthrottled', sample: index + 1, status: response.status(), metrics, errors };
                results.push(item);
                console.log(JSON.stringify({ path, profile: item.profile, lcp: metrics.lcp?.ms, cls: metrics.cls, interaction: metrics.maxObservedInteractionMs, errors: errors.length }));
            } catch (error) { results.push({ path, mobile, error: error.message }); console.log(error.message); }
            await context.close();
        }
    }
} finally { await browser.close(); }
await writeFile(`${output}/performance.json`, JSON.stringify({ base, browserVersion, nodeVersion: process.version, measuredAt: new Date().toISOString(), observation: 'DOMContentLoaded + 12s, fresh contexts, cache disabled; lab interaction is not field INP', results }, null, 2));
