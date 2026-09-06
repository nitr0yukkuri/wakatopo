import type { WritingArticle } from '@/lib/writing/content';
import { renderMarkdownToHtml } from '@/lib/writing/content';

export default function WritingArticleBody({ article }: { article: WritingArticle }) {
    return (
        <div
            className="writing-prose"
            dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(article.content) }}
        />
    );
}
