import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';

const targetUrl = process.env.OGP_RECORD_URL ?? 'http://127.0.0.1:3000/ogp';
const videoDir = process.env.OGP_RECORD_VIDEO_DIR ?? './videos/ogp';
const width = Number(process.env.OGP_RECORD_WIDTH ?? 1200);
const height = Number(process.env.OGP_RECORD_HEIGHT ?? 630);
const warmupMs = Number(process.env.OGP_RECORD_WARMUP_MS ?? 1200);
const recordMs = Number(process.env.OGP_RECORD_MS ?? 3800);
const screenshotPath = process.env.OGP_RECORD_READY_SCREENSHOT;

await rm(videoDir, { recursive: true, force: true });
await mkdir(videoDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: {
        dir: videoDir,
        size: { width, height },
    },
});
const page = await context.newPage();

console.log(`Navigating to ${targetUrl}...`);
await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('[data-ogp-ready="true"]', { state: 'attached', timeout: 60000 });
await page.waitForTimeout(warmupMs);

if (screenshotPath) {
    await page.screenshot({ path: screenshotPath });
}

console.log(`Recording ${recordMs}ms of the fixed Living Planet OGP scene...`);
await page.waitForTimeout(recordMs);

await context.close();
await browser.close();
console.log(`Recording finished. Video saved in ${videoDir}.`);
