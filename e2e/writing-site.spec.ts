import { expect, test } from '@playwright/test';

test.describe('Writing / Notes', () => {
    test('keeps sample articles hidden until they are ready', async ({ page }) => {
        await page.goto('/writing', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('[data-writing-page="archive"]')).toHaveCount(1);
        await expect(page.locator('.writing-site')).toHaveCount(1);
        await expect(page.locator('.writing-atmosphere')).toHaveCount(1);
        await expect(page.locator('.writing-year')).toHaveCount(0);
        await expect(page.locator('.writing-article-link')).toHaveCount(0);
        await expect(page.locator('.writing-empty')).toContainText('まだ公開された記録はありません');
        await expect(page.locator('.writing-environment')).toHaveCount(0);
        await expect(page.locator('audio')).toHaveCount(0);
        await expect(page.locator('a[href="/writing"]')).toHaveCount(1);
        await expect(page.locator('a[href="/otenkigurashi"]')).toHaveCount(0);
    });

    test('does not expose a draft article route', async ({ page }) => {
        const response = await page.goto('/writing/2026-living-planet', { waitUntil: 'domcontentloaded' });
        expect(response?.status()).toBe(404);
    });

    test('does not overflow an iPhone-sized viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/writing', { waitUntil: 'domcontentloaded' });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(1);
    });

    test('keeps Portfolio and Notes responsibilities separate', async ({ page }) => {
        await page.goto('/?lang=ja', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('a[href="/writing"]')).toHaveCount(0);

        await page.goto('/writing', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('a[href="/github-planet"]')).toHaveCount(0);
        await expect(page.locator('a[href="/coldkeep"]')).toHaveCount(0);
    });
});
