import { getPublicArticles } from '@/lib/writing/content';
import { writingUrl } from '@/lib/writing/site';

const escapeXml = (value: string) =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');

export async function GET() {
    const articles = getPublicArticles();
    const items = articles.map((article) => [
        '<item>',
        '<title>' + escapeXml(article.title) + '</title>',
        '<link>' + escapeXml(writingUrl(article.slug)) + '</link>',
        '<guid isPermaLink="true">' + escapeXml(writingUrl(article.slug)) + '</guid>',
        '<pubDate>' + new Date(article.date + 'T00:00:00+09:00').toUTCString() + '</pubDate>',
        '<description>' + escapeXml(article.description) + '</description>',
        '</item>',
    ].join('')).join('');

    const feed = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0"><channel>',
        '<title>Notes | WAKATO</title>',
        '<link>' + escapeXml(writingUrl()) + '</link>',
        '<description>WAKATOの記録</description>',
        items,
        '</channel></rss>',
    ].join('');

    return new Response(feed, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
    });
}
