import { devices, expect, test } from '@playwright/test';

const routes = [
    '/',
    '/about',
    '/github-planet',
    '/otenkigurashi',
    '/coldkeep',
    '/recaptcha-game',
    '/denshouo',
    '/card',
];

const { defaultBrowserType, ...iphone13 } = devices['iPhone 13'];
void defaultBrowserType;

test.use(iphone13);

test.describe('mobile smoke', () => {
    for (const route of routes) {
        test(`${route} loads without a client-side crash`, async ({ page }) => {
            const pageErrors: string[] = [];

            page.on('pageerror', (error) => {
                pageErrors.push(error.stack || error.message);
            });

            await page.goto(route, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2500);

            await expect(page.locator('main')).toBeVisible();
            await expect(page.locator('body')).not.toContainText(/Application error|client-side exception/i);
            expect(pageErrors).toEqual([]);
        });
    }
});
