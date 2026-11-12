import type { MetadataRoute } from 'next';
import { pageUrl, seoPages, type SeoPage } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
    return (Object.keys(seoPages) as SeoPage[]).flatMap(page => (['ja', 'en'] as const).map(lang => ({
        url: pageUrl(page, lang),
        alternates: { languages: { ja: pageUrl(page, 'ja'), en: pageUrl(page, 'en'), 'x-default': pageUrl(page, 'ja') } },
    })));
}
