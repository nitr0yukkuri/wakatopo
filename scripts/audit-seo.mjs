import { mkdir, writeFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const base = process.argv[2] || 'http://127.0.0.1:3011';
const output = process.argv[3] || 'tmp/seo-audit';
await mkdir(output, { recursive: true });
const paths = ['/', '/about', '/github-planet', '/otenkigurashi', '/coldkeep', '/recaptcha-game', '/denshouo'];
const urls = paths.flatMap(path => [path, `${path}?lang=en`]);
urls.push('/?lang=ja&weather=Rain&season=autumn', '/card', '/ogp', '/seo-missing-page', '/robots.txt', '/sitemap.xml', '/manifest.webmanifest');
const results = [];
for (const path of urls) {
    try {
        const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(45000) });
        const html = await response.text();
        const document = new JSDOM(html).window.document;
        const attr = (selector, name = 'content') => document.querySelector(selector)?.getAttribute(name) ?? null;
        const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map(el => {
            try { return JSON.parse(el.textContent); } catch { return { parseError: true }; }
        });
        document.querySelectorAll('script,style').forEach(el => el.remove());
        const item = {
            path, status: response.status, finalUrl: response.url,
            headers: Object.fromEntries(['content-type', 'x-robots-tag', 'location', 'cache-control'].map(key => [key, response.headers.get(key)])),
            title: document.title, description: attr('meta[name="description"]'),
            canonical: attr('link[rel="canonical"]', 'href'), lang: document.documentElement.lang,
            alternates: [...document.querySelectorAll('link[hreflang]')].map(el => [el.hreflang, el.href]),
            ogTitle: attr('meta[property="og:title"]'), ogUrl: attr('meta[property="og:url"]'),
            twitterCard: attr('meta[name="twitter:card"]'), robots: attr('meta[name="robots"]'),
            headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(el => [el.tagName, el.textContent.trim()]),
            images: [...document.images].map(el => ({ src: el.getAttribute('src'), alt: el.getAttribute('alt'), width: el.width, height: el.height })),
            links: [...document.querySelectorAll('a[href]')].map(el => [el.getAttribute('href'), el.textContent.trim()]),
            textLength: document.body.textContent.trim().length, schemas,
        };
        results.push(item);
        await writeFile(`${output}/${path.replace(/[^a-z0-9]/gi, '_') || 'home'}.html`, html);
        console.log(`${response.status} ${path}: ${item.title} | h1=${item.headings.filter(([tag]) => tag === 'H1').length} canonical=${item.canonical}`);
    } catch (error) { results.push({ path, error: error.message }); console.log(`${path}: ${error.message}`); }
}
await writeFile(`${output}/audit.json`, JSON.stringify({ base, measuredAt: new Date().toISOString(), results }, null, 2));
