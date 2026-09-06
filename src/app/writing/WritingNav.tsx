import Link from 'next/link';
import { PORTFOLIO_SITE_URL } from '@/lib/writing/site';

export default function WritingNav() {
    return (
        <nav className="writing-nav" aria-label="記事サイト">
            <a href={PORTFOLIO_SITE_URL} className="writing-brand">WAKATO</a>
            <span className="writing-nav-divider" aria-hidden="true">/</span>
            <Link href="/writing" className="writing-nav-link" aria-current="page">ARCHIVE</Link>
        </nav>
    );
}

export function WritingFooter() {
    return (
        <footer className="writing-footer">
            <p>静かな場所に、考えたことを置いていく。</p>
            <a href={PORTFOLIO_SITE_URL} className="writing-footer-link">Return to Portfolio</a>
        </footer>
    );
}
