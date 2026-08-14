import { expect, test, type Page } from '@playwright/test';

const route = (weather: string, season = 'none', seasonEvent = 'none') =>
    `/otenkigurashi?lang=ja&weather=${weather}&season=${season}&seasonEvent=${seasonEvent}`;

const revealTenchan = async (page: Page) => {
    await page.mouse.click(100, 100);
    await expect(page.locator('[data-testid="tenchan-companion"]')).toHaveCount(1, { timeout: 5000 });
};

test.describe('Otenkigurashi weather presentation', () => {
    test('shows only the matching Ten-chan weather accessory', async ({ page }) => {
        const cases = [
            { weather: 'Rain', accessory: 'rain' },
            { weather: 'Thunder', accessory: 'thunder' },
            { weather: 'Night', accessory: 'night' },
            { weather: 'Snow', accessory: 'snow' },
        ];

        for (const current of cases) {
            await page.goto(route(current.weather), { waitUntil: 'domcontentloaded' });
            await revealTenchan(page);
            await expect(page.locator(`[data-weather-accessory="${current.accessory}"]`)).toHaveCount(1);
            await expect(page.locator('[data-weather-accessory]')).toHaveCount(1);
        }
    });

    test('does not add a weather accessory for clear or cloudy weather', async ({ page }) => {
        for (const weather of ['Clear', 'Clouds']) {
            await page.goto(route(weather), { waitUntil: 'domcontentloaded' });
            await revealTenchan(page);
            await expect(page.locator('[data-weather-accessory]')).toHaveCount(0);
        }
    });

    test('limits the winter scenery overlay to snow weather', async ({ page }) => {
        await page.goto(route('Rain', 'winter'), { waitUntil: 'domcontentloaded' });
        await expect(page.locator('.otenki-season-winter')).toHaveCount(0);

        await page.goto(route('Snow', 'winter'), { waitUntil: 'domcontentloaded' });
        await expect(page.locator('.otenki-season-winter')).toHaveCount(1);
    });

    test('uses the tsuyu atmosphere for each supported weather combination', async ({ page }) => {
        for (const weather of ['Clear', 'Clouds', 'Rain']) {
            await page.goto(route(weather, 'summer', 'tsuyu'), { waitUntil: 'domcontentloaded' });
            await expect(page.locator('[data-testid="tsuyu-atmosphere"]')).toHaveCount(1);
        }
    });
});

test.describe('Denshouo weather presentation', () => {
    test('renders marine snow only for Snow', async ({ page }) => {
        await page.goto('/denshouo?lang=ja&weather=Snow&season=winter&seasonEvent=none', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('[data-testid="marine-snow"]')).toHaveCount(1);

        await page.goto('/denshouo?lang=ja&weather=Rain&season=summer&seasonEvent=none', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('[data-testid="marine-snow"]')).toHaveCount(0);
    });
});
