import fs from 'node:fs';
import path from 'node:path';

export type WritingArticle = {
    slug: string;
    title: string;
    date: string;
    description: string;
    draft: boolean;
    tags: string[];
    content: string;
};

const CONTENT_DIR = path.join(process.cwd(), 'content', 'writing');

const escapeHtml = (value: string) =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

const safeUrl = (value: string) => {
    const trimmed = value.trim();
    if (/^(https?:\/\/|\/|#|mailto:)/i.test(trimmed)) return escapeHtml(trimmed);
    return '#';
};

const slugifyHeading = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
        .trim()
        .replace(/\s+/g, '-');

const stripMarkdown = (value: string) =>
    value
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[*_~]/g, '')
        .trim();

function renderInline(value: string) {
    const codeCharacter = String.fromCharCode(96);
    const codeTokens: string[] = [];
    const codePattern = new RegExp(codeCharacter + '([^' + codeCharacter + ']+)' + codeCharacter, 'g');
    const withTokens = value.replace(codePattern, (_match, code: string) => {
        const token = '__WRITING_CODE_' + codeTokens.length + '__';
        codeTokens.push('<code>' + escapeHtml(code) + '</code>');
        return token;
    });

    let html = escapeHtml(withTokens);
    html = html.replace(
        /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
        (_match, alt: string, source: string, title?: string) =>
            '<img src="' + safeUrl(source) + '" alt="' + escapeHtml(alt) + '"' +
            (title ? ' title="' + escapeHtml(title) + '"' : '') +
            ' loading="lazy" decoding="async" />',
    );
    html = html.replace(
        /\[([^\]]+)\]\(([^)\s]+)\)/g,
        (_match, label: string, href: string) =>
            '<a href="' + safeUrl(href) + '">' + label + '</a>',
    );
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    return html.replace(/__WRITING_CODE_(\d+)__/g, (_match, index: string) => codeTokens[Number(index)] ?? '');
}

function isBlockStart(line: string) {
    return (
        /^#{1,6}\s+/.test(line) ||
        line.startsWith('> ') ||
        /^[-*]\s+/.test(line) ||
        /^\d+\.\s+/.test(line) ||
        line.startsWith('~~~') ||
        line.trim() === ''
    );
}

export function renderMarkdownToHtml(markdown: string) {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const html: string[] = [];
    const fenceMarker = '~~~';
    let index = 0;

    while (index < lines.length) {
        const line = lines[index];

        if (!line.trim()) {
            index += 1;
            continue;
        }

        if (line.startsWith(fenceMarker)) {
            const language = line.slice(fenceMarker.length).trim();
            const codeLines: string[] = [];
            index += 1;
            while (index < lines.length && !lines[index].startsWith(fenceMarker)) {
                codeLines.push(lines[index]);
                index += 1;
            }
            if (index < lines.length) index += 1;
            const className = language ? ' class="language-' + escapeHtml(language) + '"' : '';
            html.push('<pre><code' + className + '>' + escapeHtml(codeLines.join('\n')) + '</code></pre>');
            continue;
        }

        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
            const level = heading[1].length;
            const text = heading[2].trim();
            const id = slugifyHeading(stripMarkdown(text));
            html.push('<h' + level + ' id="' + escapeHtml(id) + '">' + renderInline(text) + '</h' + level + '>');
            index += 1;
            continue;
        }

        if (line.startsWith('> ')) {
            const quoteLines: string[] = [];
            while (index < lines.length && lines[index].startsWith('> ')) {
                quoteLines.push(lines[index].slice(2));
                index += 1;
            }
            html.push('<blockquote>' + renderInline(quoteLines.join('\n')) + '</blockquote>');
            continue;
        }

        if (/^[-*]\s+/.test(line)) {
            const items: string[] = [];
            while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
                items.push('<li>' + renderInline(lines[index].replace(/^[-*]\s+/, '')) + '</li>');
                index += 1;
            }
            html.push('<ul>' + items.join('') + '</ul>');
            continue;
        }

        if (/^\d+\.\s+/.test(line)) {
            const items: string[] = [];
            while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
                items.push('<li>' + renderInline(lines[index].replace(/^\d+\.\s+/, '')) + '</li>');
                index += 1;
            }
            html.push('<ol>' + items.join('') + '</ol>');
            continue;
        }

        const paragraphLines = [line];
        index += 1;
        while (index < lines.length && !isBlockStart(lines[index])) {
            paragraphLines.push(lines[index]);
            index += 1;
        }
        html.push('<p>' + renderInline(paragraphLines.join(' ')) + '</p>');
    }

    return html.join('\n');
}

function parseFrontmatter(raw: string, filename: string) {
    const normalized = raw.replace(/\r\n/g, '\n');
    const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) {
        throw new Error('Missing frontmatter: ' + filename);
    }

    const fields: Record<string, string> = {};
    for (const line of match[1].split('\n')) {
        const separator = line.indexOf(':');
        if (separator === -1) continue;
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
        fields[key] = value;
    }

    const slug = fields.slug || filename.replace(/\.(md|mdx)$/i, '');
    const date = fields.date || '';
    if (!fields.title || !date) {
        throw new Error('Article requires title and date: ' + filename);
    }

    let tags: string[] = [];
    if (fields.tags) {
        try {
            const parsed = JSON.parse(fields.tags);
            tags = Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
            tags = fields.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
        }
    }

    return {
        slug,
        title: fields.title,
        date,
        description: fields.description || 'WAKATOの開発と考えを記録する。',
        draft: fields.draft === 'true',
        tags,
        content: match[2].trim(),
    } satisfies WritingArticle;
}

function readArticle(filename: string) {
    const filePath = path.join(CONTENT_DIR, filename);
    return parseFrontmatter(fs.readFileSync(filePath, 'utf8'), filename);
}

function listArticleFiles() {
    if (!fs.existsSync(CONTENT_DIR)) return [];
    return fs
        .readdirSync(CONTENT_DIR)
        .filter((filename) => !filename.startsWith('_') && /\.(md|mdx)$/i.test(filename))
        .sort();
}

export function getPublicArticles() {
    return listArticleFiles()
        .map(readArticle)
        .filter((article) => !article.draft)
        .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function getArticleBySlug(slug: string) {
    return getPublicArticles().find((article) => article.slug === slug) ?? null;
}
