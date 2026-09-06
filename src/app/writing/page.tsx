import type { Metadata } from 'next';
import Link from 'next/link';
import WritingNav, { WritingFooter } from './WritingNav';
import WritingShell from './WritingShell';
import { getPublicArticles, type WritingArticle } from '@/lib/writing/content';
import {
    getWritingTimeBand,
    parseWritingTimeBand,
    parseWritingWeather,
    type WritingTimeBand,
    type WritingWeather,
} from '@/lib/writing/theme';
import { getWritingWeather } from '@/lib/writing/weather';
import { WRITING_OG_IMAGE, WRITING_SITE_URL } from '@/lib/writing/site';

export const revalidate = 300;

export const metadata: Metadata = {
    title: 'Notes | WAKATO',
    description: 'WAKATOが考えたこと、作ったもの、観察したことを静かに読む場所。',
    alternates: { canonical: WRITING_SITE_URL },
    openGraph: {
        title: 'Notes | WAKATO',
        description: 'WAKATOの記録を静かに読む場所。',
        url: WRITING_SITE_URL,
        type: 'website',
        images: [{ url: WRITING_OG_IMAGE, width: 1200, height: 630, alt: 'WAKATO' }],
    },
};

type SearchParams = {
    writingTime?: string | string[];
    writingWeather?: string | string[];
};

const firstValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

function groupByYear(articles: WritingArticle[]) {
    const groups = new Map<string, WritingArticle[]>();
    for (const article of articles) {
        const year = article.date.slice(0, 4);
        const entries = groups.get(year) ?? [];
        entries.push(article);
        groups.set(year, entries);
    }
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

async function getEnvironment(searchParams: SearchParams) {
    const timeOverride = parseWritingTimeBand(firstValue(searchParams.writingTime));
    const weatherOverride = parseWritingWeather(firstValue(searchParams.writingWeather));
    const timeBand: WritingTimeBand = timeOverride ?? getWritingTimeBand(new Date());
    const weather: WritingWeather = weatherOverride ?? await getWritingWeather();
    return {
        initialTimeBand: timeBand,
        initialWeather: weather,
        lockTimeBand: Boolean(timeOverride),
        lockWeather: Boolean(weatherOverride),
    };
}

export default async function WritingIndexPage({
    searchParams,
}: {
    searchParams?: SearchParams | Promise<SearchParams>;
}) {
    const resolvedSearchParams = (await searchParams) ?? {};
    const environment = await getEnvironment(resolvedSearchParams);
    const articles = getPublicArticles();
    const yearGroups = groupByYear(articles);

    return (
        <WritingShell {...environment}>
            <WritingNav />
            <header className="writing-header writing-container">
                <p className="writing-eyebrow">A QUIET PLACE FOR NOTES</p>
                <h1 className="writing-title">Notes</h1>
                <p className="writing-lead">
                    検索で流れてしまう前に、考えたことを文章として置いておく。
                    作品の裏側や、実装中に見つけた小さな発見を記録しています。
                </p>
            </header>

            <main className="writing-container writing-archive" data-writing-page="archive">
                {yearGroups.map(([year, yearArticles]) => (
                    <section key={year} className="writing-year" aria-labelledby={'writing-year-' + year}>
                        <h2 id={'writing-year-' + year} className="writing-year-title">{year}</h2>
                        <ul className="writing-article-list">
                            {yearArticles.map((article) => (
                                <li key={article.slug} className="writing-article-item">
                                    <Link href={'/writing/' + article.slug} className="writing-article-link">
                                        <span className="writing-article-title">{article.title}</span>
                                        <span className="writing-article-meta">
                                            <time dateTime={article.date}>{article.date}</time>
                                            {article.tags.length > 0 && <span>{article.tags.join(' / ')}</span>}
                                        </span>
                                        <span className="writing-article-description">{article.description}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
                {articles.length === 0 && (
                    <p className="writing-empty">まだ公開された記録はありません。</p>
                )}
            </main>

            <WritingFooter />
        </WritingShell>
    );
}
