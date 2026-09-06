import type { MetadataRoute } from 'next';
import { getPublicArticles } from '@/lib/writing/content';
import { writingUrl } from '@/lib/writing/site';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return [
        { url: writingUrl(), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
        ...getPublicArticles().map((article) => ({
            url: writingUrl(article.slug),
            lastModified: new Date(article.date),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        })),
    ];
}
