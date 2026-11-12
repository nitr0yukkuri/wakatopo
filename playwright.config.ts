import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
    fullyParallel: false,
    retries: 0,
    workers: 1,
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
        channel: process.env.PLAYWRIGHT_CHANNEL === 'chrome' ? 'chrome' : undefined,
        launchOptions: process.env.PLAYWRIGHT_CHANNEL === 'chrome'
            ? { args: ['--enable-unsafe-swiftshader'] }
            : undefined,
        headless: true,
        trace: 'on-first-retry',
    },
    webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
        command: 'npm run dev -- --hostname 127.0.0.1 --port 3000',
        url: 'http://127.0.0.1:3000',
        timeout: 120_000,
        reuseExistingServer: true,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
