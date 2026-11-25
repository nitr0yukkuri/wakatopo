import { expect, test } from '@playwright/test';

test.describe('Living Card capture route', () => {
    for (const { weather, visual, season, event } of [
        { weather: 'Clear', visual: 'Morning', season: 'spring', event: 'none' },
        { weather: 'Morning', visual: 'Morning', season: 'winter', event: 'first_light' },
        { weather: 'Rain', visual: 'Rain', season: 'summer', event: 'tsuyu' },
        { weather: 'Snow', visual: 'Snow', season: 'winter', event: 'none' },
        { weather: 'Night', visual: 'Night', season: 'autumn', event: 'none' },
    ]) {
        test(`preserves the capture contract for ${weather}`, async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 400 });
            await page.goto(`/card?weather=${weather}&season=${season}&seasonEvent=${event}`, { waitUntil: 'domcontentloaded' });
            const card = page.locator('main.card-capture-page');
            await expect(card).toHaveAttribute('data-preview-weather', weather);
            await expect(card).toHaveAttribute('data-world-weather', visual);
            await expect(card).toHaveAttribute('data-world-season', season);
            await expect(card).toHaveAttribute('data-world-season-event', event);
            await expect(card).toContainText('WAKATO | LIVING PLANET');
            await expect(card).toContainText(`STATUS: ACTIVE // WEATHER: ${weather.toUpperCase()}`);
            await expect(card).toContainText('LIVE PREVIEW');
            await expect(card).toHaveCSS('width', '800px');
            await expect(card).toHaveCSS('height', '400px');
            // The portable capture card has no portfolio-specific social links.
            await expect(card.locator('a[href*="x.com"]')).toHaveCount(0);
            // SafeCanvas still provides a fallback on environments without WebGL.
            await expect(card.locator('canvas, [data-webgl-fallback]').first()).toBeAttached();
        });
    }
});
