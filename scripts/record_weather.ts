import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';

const targetUrl = process.env.WEATHER_RECORD_URL ?? 'https://wakato.tech/card';
const videoDir = process.env.WEATHER_RECORD_VIDEO_DIR ?? './videos';
const width = Number(process.env.WEATHER_RECORD_WIDTH ?? 800);
const height = Number(process.env.WEATHER_RECORD_HEIGHT ?? 400);
const warmupMs = Number(process.env.WEATHER_RECORD_WARMUP_MS ?? 15000);
const recordMs = Number(process.env.WEATHER_RECORD_MS ?? 5000);
const screenshotPath = process.env.WEATHER_RECORD_READY_SCREENSHOT;

(async () => {
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

    console.log(`Waiting ${warmupMs}ms for the weather scene to settle...`);
    await page.waitForTimeout(warmupMs);

    if (screenshotPath) {
        await page.screenshot({ path: screenshotPath });
    }

    console.log(`Recording ${recordMs}ms of the live weather scene...`);
    await page.waitForTimeout(recordMs);

    await context.close();
    await browser.close();

    console.log(`Recording finished. Video saved in ${videoDir}.`);
})();
