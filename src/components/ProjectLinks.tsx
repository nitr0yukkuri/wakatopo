import Link from 'next/link';
import { localizedPath, seoPages, type SeoPage, type SiteLang } from '@/lib/seo';

export default function ProjectLinks({ page, lang }: { page: Exclude<SeoPage, 'home'>; lang: SiteLang }) {
    return (
        <footer lang={lang} className="relative z-10 border-t border-white/10 bg-[#050505] px-6 py-10 text-xs font-mono text-gray-400">
            <div className="mx-auto max-w-5xl space-y-6">
                <nav aria-label={lang === 'en' ? 'Breadcrumb' : 'パンくず'} className="flex flex-wrap gap-3">
                    <Link href={localizedPath('/', lang)} prefetch={false} className="hover:text-cyan-200">WAKATO | Living Planet</Link><span aria-hidden="true">/</span><span aria-current="page">{seoPages[page].name[lang]}</span>
                </nav>
                <nav aria-label={lang === 'en' ? 'Explore portfolio' : '作品とプロフィール'} className="flex flex-wrap gap-x-6 gap-y-4">
                    {(Object.keys(seoPages) as SeoPage[]).filter(key => key !== 'home' && key !== page).map(key => <Link key={key} href={localizedPath(seoPages[key].path, lang)} prefetch={false} className="hover:text-cyan-200">{seoPages[key].name[lang]}</Link>)}
                </nav>
                <nav aria-label="Language" className="flex gap-4">
                    <Link href={localizedPath(seoPages[page].path, 'ja')} hrefLang="ja" lang="ja" aria-current={lang === 'ja' ? 'page' : undefined}>日本語</Link>
                    <Link href={localizedPath(seoPages[page].path, 'en')} hrefLang="en" lang="en" aria-current={lang === 'en' ? 'page' : undefined}>English</Link>
                </nav>
            </div>
        </footer>
    );
}
