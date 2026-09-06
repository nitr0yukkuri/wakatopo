import { expect, test } from '@playwright/test';

const writingRoute = (time: string, weather: string) =>
    '/writing?writingTime=' + time + '&writingWeather=' + weather;

test.describe('Writing / Notes', () => {
    test('renders a quiet archive with public articles grouped by year', async ({ page }) => {
        await page.goto(writingRoute('daytime', 'clear'), { waitUntil: 'domcontentloaded' });
        await expect(page.locator('[data-writing-page="archive"]')).toHaveCount(1);
        await expect(page.locator('.writing-year')).toHaveCount(2);
        await expect(page.locator('.writing-article-link')).toHaveCount(2);
        await expect(page.locator('a[href="/writing"]')).toHaveCount(1);
        await expect(page.locator('a[href="/otenkigurashi"]')).toHaveCount(0);
    });

    test('keeps all six time themes readable and addressable', async ({ page }) => {
        for (const time of ['dawn', 'morning', 'daytime', 'evening', 'night', 'late-night']) {
            await page.goto(writingRoute(time, 'clear'), { waitUntil: 'domcontentloaded' });
            await expect(page.locator('.writing-site[data-writing-time="' + time + '"]')).toHaveCount(1);
            await expect(page.locator('.writing-environment')).toContainText('JST');
        }
    });

    test('supports every normalized weather state and unavailable fallback', async ({ page }) => {
        for (const weather of ['clear', 'cloudy', 'rain', 'snow', 'unavailable']) {
            await page.goto(writingRoute('daytime', weather), { waitUntil: 'domcontentloaded' });
            await expect(page.locator('.writing-site[data-writing-weather="' + weather + '"]')).toHaveCount(1);
        }
    });

    test('navigates from archive to article and back with keyboard-friendly links', async ({ page }) => {
        await page.goto(writingRoute('morning', 'cloudy'), { waitUntil: 'domcontentloaded' });
        await page.locator('.writing-article-link').first().click();
        await expect(page.locator('[data-writing-page="article"]')).toHaveCount(1);
        await expect(page.locator('.writing-prose')).toBeVisible();
        await page.locator('.writing-back-link').press('Enter');
        await expect(page.locator('[data-writing-page="archive"]')).toHaveCount(1);
    });

    test('does not overflow an iPhone-sized viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(writingRoute('daytime', 'snow'), { waitUntil: 'domcontentloaded' });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(1);
    });

    test('keeps Portfolio and Notes responsibilities separate', async ({ page }) => {
        await page.goto('/?lang=ja', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('a[href="/writing"]')).toHaveCount(0);

        await page.goto(writingRoute('daytime', 'clear'), { waitUntil: 'domcontentloaded' });
        await expect(page.locator('a[href="/github-planet"]')).toHaveCount(0);
        await expect(page.locator('a[href="/coldkeep"]')).toHaveCount(0);
    });
});
