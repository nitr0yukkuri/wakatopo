import type { Metadata } from 'next';
import Link from 'next/link';
import WritingNav, { WritingFooter } from './WritingNav';
import WritingShell from './WritingShell';
import { getPublicArticles, type WritingArticle } from '@/lib/writing/content';
import { WRITING_OG_IMAGE, WRITING_SITE_URL } from '@/lib/writing/site';

export const revalidate = 300;

export const metadata: Metadata = {
    title: 'Notes | WAKATO',
    description: 'WAKATOが考えたこと、作ったもの、観察したことを読む場所。',
    alternates: { canonical: WRITING_SITE_URL },
    openGraph: {
        title: 'Notes | WAKATO',
        description: 'WAKATOの記録を読む場所。',
        url: WRITING_SITE_URL,
        type: 'website',
        images: [{ url: WRITING_OG_IMAGE, width: 1200, height: 630, alt: 'WAKATO' }],
    },
};

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

export default function WritingIndexPage() {
    const articles = getPublicArticles();
    const yearGroups = groupByYear(articles);

    return (
        <WritingShell>
            <WritingNav />
            <header className="writing-header writing-container">
                <h1 className="writing-title">Notes</h1>
                <p className="writing-lead">作ったものと、考えたこと。</p>
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
