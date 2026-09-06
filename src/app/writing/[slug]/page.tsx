import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import WritingNav, { WritingFooter } from '../WritingNav';
import WritingShell from '../WritingShell';
import WritingArticleBody from '../WritingArticleBody';
import { getArticleBySlug, getPublicArticles } from '@/lib/writing/content';
import { WRITING_OG_IMAGE, writingUrl } from '@/lib/writing/site';

export const revalidate = 300;

export function generateStaticParams() {
    return getPublicArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) return {};
    return {
        title: article.title + ' | Notes | WAKATO',
        description: article.description,
        alternates: { canonical: writingUrl(article.slug) },
        openGraph: {
            title: article.title + ' | Notes | WAKATO',
            description: article.description,
            url: writingUrl(article.slug),
            type: 'article',
            publishedTime: article.date,
            tags: article.tags,
            images: [{ url: WRITING_OG_IMAGE, width: 1200, height: 630, alt: article.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title + ' | Notes | WAKATO',
            description: article.description,
            images: [WRITING_OG_IMAGE],
        },
    };
}

export default async function WritingArticlePage({
    params,
}: {
    params: { slug: string } | Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) notFound();

    return (
        <WritingShell>
            <WritingNav />
            <main className="writing-container writing-article-page" data-writing-page="article">
                <Link href="/writing" className="writing-back-link">← Archive</Link>
                <article>
                    <header className="writing-article-header">
                        <p className="writing-eyebrow">NOTE / {article.date}</p>
                        <h1 className="writing-article-heading">{article.title}</h1>
                        <p className="writing-article-description">{article.description}</p>
                        <div className="writing-article-tags" aria-label="記事タグ">
                            {article.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                        </div>
                    </header>
                    <WritingArticleBody article={article} />
                </article>
            </main>
            <WritingFooter />
        </WritingShell>
    );
}
