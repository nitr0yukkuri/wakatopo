import { pageUrl, profiles, seoPages, SITE_URL, type SeoPage, type SiteLang } from '@/lib/seo';

export default function SeoJsonLd({ page, lang }: { page: SeoPage; lang: SiteLang }) {
    const item = seoPages[page];
    const url = pageUrl(page, lang);
    const person = { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: 'WAKATO', alternateName: ['わかと', 'nitr0yukkuri'], url: `${SITE_URL}/about`, sameAs: profiles, jobTitle: 'Software Engineer / Creative Developer' };
    const website = { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'WAKATO | Living Planet', url: `${SITE_URL}/`, inLanguage: ['ja', 'en'], description: seoPages.home.description[lang], creator: { '@id': person['@id'] }, award: 'CSS Winner Site of the Day — 6 April 2026' };
    const graph: object[] = [person];
    if (page === 'home') graph.push(website);
    graph.push({
        '@type': page === 'about' ? 'ProfilePage' : 'WebPage', '@id': `${url}#webpage`, url,
        name: item.title[lang], description: item.description[lang], inLanguage: lang,
        isPartOf: { '@id': website['@id'] },
        ...(page === 'about' ? { mainEntity: { '@id': person['@id'] } } : {}),
    });
    if (page !== 'home' && page !== 'about') graph.push({ '@type': 'CreativeWork', '@id': `${url}#work`, name: item.name[lang], url, description: item.description[lang], inLanguage: lang, creator: { '@id': person['@id'] }, mainEntityOfPage: { '@id': `${url}#webpage` } });
    if (page !== 'home') graph.push({ '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'WAKATO | Living Planet', item: pageUrl('home', lang) },
        { '@type': 'ListItem', position: 2, name: item.name[lang], item: url },
    ] });
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c') }} />;
}
