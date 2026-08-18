import { expect, test } from '@playwright/test';

test('birthday command shows the home celebration with its animation styles', async ({ page }) => {

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open local shell' }).click();
    await expect(page.locator('input[placeholder="sudo make rain"]')).toBeVisible();
    await page.locator('input[placeholder="sudo make rain"]').fill('sudo make birthday');
    await page.locator('input[placeholder="sudo make rain"]').press('Enter');


    await expect(page.getByText('[ok] birthday sequence started')).toBeVisible();
    await expect(page.locator('[data-testid="birthday-cake"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="birthday-tenchan"]')).toHaveCount(0);
    await expect(page.locator('canvas[data-testid="birthday-fireworks"]')).toBeVisible();

    await page.goto('/otenkigurashi?weather=Morning&season=none&seasonEvent=birthday', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.mouse.click(100, 100);
    await expect(page.locator('[data-testid="tenchan-companion"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-birthday-accessory="birthday"]')).toBeVisible();
});
