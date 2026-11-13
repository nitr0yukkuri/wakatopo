import { expect, test, type Locator } from '@playwright/test';

async function expectRendered(element: Locator) {
    await expect(element).toBeVisible();
    const hiddenAncestor = await element.evaluate(node => {
        for (let current: Element | null = node; current; current = current.parentElement) {
            const style = getComputedStyle(current);
            if (current.hasAttribute('hidden') || style.display === 'none'
                || ['hidden', 'collapse'].includes(style.visibility)
                || Number(style.opacity) === 0 || style.contentVisibility === 'hidden') {
                return current.tagName;
            }
        }
        return null;
    });
    expect(hiddenAncestor, 'content must be painted, including all of its ancestors').toBeNull();
}

const routes = ['/', '/about', '/github-planet', '/otenkigurashi', '/coldkeep', '/recaptcha-game', '/denshouo'];
const origin = 'https://wakato.tech';

test.describe('server-rendered SEO without JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    for (const path of routes) for (const lang of ['ja', 'en']) {
        test(`${path} ${lang} has localized metadata and readable content`, async ({ page }, testInfo) => {
            const response = await page.goto(`${path}?lang=${lang}`);
            expect(response?.status()).toBe(200);
            await expect(page.locator('html')).toHaveAttribute('lang', lang);
            await expect(page.locator('h1')).toHaveCount(1);
            await expect(page.locator('head title')).toHaveCount(1);
            expect(await page.title()).toContain('WAKATO');
            const canonical = `${origin}${path}${lang === 'en' ? '?lang=en' : ''}`;
            // https://host and https://host/ identify the same root resource.
            for (const [selector, attribute, expected] of [
                ['head link[rel="canonical"]', 'href', canonical],
                ['head link[hreflang="ja"]', 'href', `${origin}${path}`],
                ['head link[hreflang="en"]', 'href', `${origin}${path}?lang=en`],
                ['head link[hreflang="x-default"]', 'href', `${origin}${path}`],
                ['meta[property="og:url"]', 'content', canonical],
            ]) expect(new URL((await page.locator(selector).getAttribute(attribute))!).href).toBe(new URL(expected).href);
            await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
            expect((await page.locator('meta[name="description"]').getAttribute('content'))?.length).toBeGreaterThan(50);
            const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
            expect(schemas).toHaveLength(1);
            const graph = JSON.parse(schemas[0])['@graph'];
            expect(graph.some((node: Record<string, unknown>) => node['@type'] === 'Person')).toBe(true);
            if (path !== '/') expect(graph.some((node: Record<string, unknown>) => node['@type'] === 'BreadcrumbList')).toBe(true);
            if (path !== '/' && path !== '/about') expect(graph.some((node: Record<string, unknown>) => node['@type'] === 'CreativeWork')).toBe(true);
            await expectRendered(page.locator('main'));
            // innerText on an unrendered element can still return textContent.
            // The rendered body and ancestor checks must both pass.
            expect((await page.locator('body').innerText()).length).toBeGreaterThan(250);
            for (const content of await page.locator('[data-readable-without-js]').all()) await expectRendered(content);
            if (path === '/coldkeep') await expectRendered(page.getByRole('link', { name: 'VIEW SOURCE ON GITHUB ↗', exact: true }));
            for (const image of await page.locator('img').all()) expect(await image.getAttribute('alt')).not.toBeNull();
            if (path === '/') for (const work of routes.slice(2)) await expectRendered(page.locator(`a[href="${work}${lang === 'en' ? '?lang=en' : ''}"]`).first());
            if (path !== '/') {
                await expect(page.getByRole('navigation', { name: 'Language', exact: true }).getByRole('link', { name: 'English' })).toHaveAttribute('href', `${path}?lang=en`);
            }
            if (lang === 'ja' && (path === '/' || path === '/coldkeep')) {
                if (path === '/coldkeep') await page.getByRole('link', { name: 'VIEW SOURCE ON GITHUB ↗', exact: true }).scrollIntoViewIfNeeded();
                await page.screenshot({ path: testInfo.outputPath('without-javascript.png'), fullPage: path === '/' });
            }
        });
    }
    test('work links really navigate without JavaScript', async ({ page }) => {
        await page.goto('/?lang=en');
        const link = page.locator('a').filter({ has: page.locator('h3', { hasText: 'GitHub Planet' }) });
        await expectRendered(link);
        await link.click();
        await expect(page).toHaveURL(/\/github-planet\?lang=en/);
        await expectRendered(page.locator('main'));
    });
    test('presentation parameters collapse to the same canonical', async ({ page }) => {
        await page.goto('/?lang=ja&weather=Rain&season=winter&seasonEvent=none');
        expect(new URL((await page.locator('link[rel="canonical"]').getAttribute('href'))!).href).toBe(`${origin}/`);
        await page.goto('/?lang=en&weather=Snow');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}/?lang=en`);
    });
});

test('sitemap, robots, capture routes and a genuine 404', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect((xml.match(/<loc>/g) || [])).toHaveLength(14);
    expect(xml).toContain('hreflang="en"');
    expect(xml).not.toMatch(/weather=|season=|\/card|\/ogp/);
    const robots = await request.get('/robots.txt');
    expect(await robots.text()).toContain('Sitemap: https://wakato.tech/sitemap.xml');
    for (const path of ['/card', '/ogp']) {
        const response = await request.get(path);
        expect(response.status()).toBe(200);
        expect(await response.text()).toMatch(/name="robots" content="noindex, nofollow"/);
    }
    const missing = await request.get('/seo-page-does-not-exist');
    expect(missing.status()).toBe(404);
    expect(await missing.text()).toContain('noindex');
});

test('works remain keyboard navigable with the existing transition', async ({ page }) => {
    await page.goto('/?lang=en');
    await expect(page.getByRole('button', { name: /Start sound|Mute sound|Unmute sound/i })).toBeVisible();
    const work = page.locator('a').filter({ has: page.locator('h3', { hasText: 'GitHub Planet' }) });
    await work.focus();
    await expect(work).toBeFocused();
    await work.press('Enter');
    await expect(page).toHaveURL(/\/github-planet\?lang=en/, { timeout: 15000 });
    await expect(page.locator('h1')).toHaveText('GitHub Planet');
});

test('WebGL failure preserves the HTML portfolio', async ({ page }) => {
    await page.addInitScript(`const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
            if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
            return originalGetContext.call(this, type, ...args);
        };`);
    await page.goto('/?lang=en');
    await expect(page.locator('[data-webgl-fallback]').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('h1')).toContainText('LIVING');
    await expect(page.locator('main')).toBeVisible();
    const work = page.locator('a').filter({ has: page.locator('h3', { hasText: 'GitHub Planet' }) });
    await expect(work).toBeAttached();
    await expect(page.locator('body')).not.toContainText(/Application error|client-side exception/i);
});

test('client language navigation keeps document and metadata aligned', async ({ page }) => {
    await page.goto('/about?lang=en');
    await expect(page.getByRole('button', { name: /Start sound|Enable sound|Disable sound/ })).toBeVisible();
    await page.getByRole('navigation', { name: 'Language', exact: true }).getByRole('link', { name: '日本語' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page).toHaveTitle(/わかと/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}/about`);
});

test('supported WebGL still renders the home and project scenes', async ({ page }) => {
    for (const path of ['/?lang=en&weather=Clear&season=autumn&seasonEvent=none', '/github-planet?lang=en']) {
        await page.goto(path);
        if (path.startsWith('/github-planet')) await page.mouse.wheel(0, 250);
        await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20000 });
        // R3F keeps native canvas fallback children in the DOM even with WebGL.
        await expect(page.locator('[data-webgl-fallback]:visible')).toHaveCount(0);
        const version = await page.locator('canvas').first().evaluate(canvas => {
            const gl = (canvas as HTMLCanvasElement).getContext('webgl2');
            return gl?.getParameter(gl.VERSION);
        });
        expect(version).toContain('WebGL 2.0');
    }
});
