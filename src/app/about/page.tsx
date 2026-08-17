import Link from 'next/link';
import Image from 'next/image';
import GeoLocationBadge from '@/components/dom/GeoLocationBadge';

export const dynamic = 'force-dynamic';
type SearchParams = {
    lang?: string | string[];
};

const copyByLang = {
    ja: {
        returnToOrbit: 'Return to Portfolio',
        role: 'Interactive Web Developer / Creative Coder',
        internship: 'INTERNSHIP WELCOME',
        sectionCareer: '経歴',
        careerText:
            'ECCコンピュータ専門学校在学（29卒）。現時点ではフロントエンド・バックエンドのどちらかに限定するのではなく、ソフトウェアエンジニアとしてプロダクト全体に関われる力を伸ばしたいと考えています。UI/UXや3D表現、インタラクション実装だけでなく、API設計、データ設計、パフォーマンス改善まで、ユーザー体験から逆算して必要な技術を選び、設計から実装、改善まで担えるSWEを目指しています。',
        sectionAchievements: '実績',
        achievements: [
            '2025',
            '技育CAMP Vol.10 優秀賞 でんしょうお',
            '技育CAMP Vol.12 努力賞 きじょバト',
            'うめきたTechBase 最優秀賞 グルメイカー',
            '技育CAMP Vol.14 優秀賞 GitHub Planet',
            '技育博 Vol.5 展示 おてんきぐらし | グルメイカー',
            'ヒーローズ・リーグ 決勝進出 GitHub Planet',
            '2026',
            '技育博 Vol.6 企業賞(ウイングアーク1st) GitHub Planet',
            '技育CAMP Vol.19 最優秀賞 recaptchaゲーム',
            '機械学習基盤体験型2daysサイバーエージェントインターンシップ 参加',
            'CSS Winner SOTD WAKATO | Living Planet Portfolio',
            '技育博 Vol.1 展示　recaptchagame',
        ],
        sectionDev: '開発体制',
        devText:
            '個人で要件整理・UI設計・実装・デプロイまで一貫対応。必要に応じてAPI/DB連携まで対応可能。',
        sectionAvailability: '稼働可能時期',
        availabilityText:
            'インターン・業務委託ともに相談可。短期PoC/プロトタイプ案件は優先して調整可能。',
        sectionStrengths: 'カンファレンス',
        activities: [
            '2025',
            'フロントエンドカンファレンス 2025 参加',
            '2026',
            '技育祭2026【春】東京 参加（3/21–22）',
            '技育祭2026【春】名古屋 参加（4/26）',
            'TSKaigi 2026 参加（5/22–23）',
            '技育祭2026【春】福岡 参加（6/20）',
            '技育祭2026【春】関西 アンバサダー（7/11）',
            'STORES Tech Conf 2026 参加予定（8/31）',
            'DroidKaigi 2026 参加予定（9/1–3）',
            'iOSDC Japan 2026 参加予定（9/11–13）',
            '技育祭2026【秋】東京 参加予定（10/10–11）',
            'フロントエンドカンファレンス関西2026 参加予定（10/12）',
            'Vue Fes Japan 2026 参加予定（10/24）',
            'Kotlin Fest 2026 参加予定（11/14）',
        ],
    },
    en: {
        returnToOrbit: 'Return to Portfolio',
        role: 'Interactive Web Developer / Creative Coder',
        internship: 'INTERNSHIP WELCOME',
        sectionCareer: 'CAREER',
        careerText:
            'I am currently studying at ECC Computer College (Class of 2029). Rather than limiting myself to either frontend or backend, I want to grow as a software engineer who can work across the whole product. I aim to choose the right technologies from the user experience backward, covering UI/UX, 3D expression, interaction implementation, API design, data design, and performance improvements.',
        sectionAchievements: 'ACHIEVEMENTS',
        achievements: [
            '2025',
            'GeekCamp Vol.10 Excellence Award - Denshouo',
            'GeekCamp Vol.12 Effort Award - Kijobato',
            'Umeda TechBase Grand Prize - Gurumeiker',
            'GeekCamp Vol.14 Excellence Award - GitHub Planet',
            'Geek Expo Vol.5 Exhibition - Otenkigurashi | Gurumeiker',
            'Heroes League Finalist - GitHub Planet',
            '2026',
            'Geek Expo Vol.6 Corporate Award (WingArc 1st) - GitHub Planet',
            'GeekCamp Vol.19 Grand Prize - reCAPTCHA Game',
            'CyberAgent 2-day Hands-on ML Platform Internship - Participant',
            'CSS Winner SOTD WAKATO | Living Planet Portfolio',
            'Geek Expo Vol.1 Exhibition - recaptchagame',
        ],
        sectionDev: 'DEVELOPMENT STYLE',
        devText:
            'I handle projects end-to-end as an individual, from requirement definition and UI design to implementation and deployment. I can also cover API and database integration when needed.',
        sectionAvailability: 'AVAILABILITY',
        availabilityText:
            'Open to both internships and contract work. Short-term PoC and prototype projects can be prioritized.',
        sectionStrengths: 'CONFERENCES',
        activities: [
            '2025',
            'Frontend Conference 2025 - Participant',
            '2026',
            'Geek Festival 2026 [Spring] Tokyo - Participant (Mar 21–22)',
            'Geek Festival 2026 [Spring] Nagoya - Participant (Apr 26)',
            'TSKaigi 2026 - Participant (May 22–23)',
            'Geek Festival 2026 [Spring] Fukuoka - Participant (Jun 20)',
            'Geek Festival 2026 [Spring] Kansai - Ambassador (Jul 11)',
            'STORES Tech Conf 2026 - Planned (Aug 31)',
            'DroidKaigi 2026 - Planned (Sep 1–3)',
            'iOSDC Japan 2026 - Planned (Sep 11–13)',
            'Geek Festival 2026 [Autumn] Tokyo - Planned (Oct 10–11)',
            'Frontend Conference Kansai 2026 - Planned (Oct 12)',
            'Vue Fes Japan 2026 - Planned (Oct 24)',
            'Kotlin Fest 2026 - Planned (Nov 14)',
        ],
    },
} as const;

export default async function AboutPage({
    searchParams,
}: {
    searchParams?: SearchParams | Promise<SearchParams>;
}) {
    const resolvedSearchParams = (await searchParams) ?? {};
    const langParam = Array.isArray(resolvedSearchParams.lang)
        ? resolvedSearchParams.lang[0]
        : resolvedSearchParams.lang;
    const lang = langParam === 'en' ? 'en' : 'ja';
    const t = copyByLang[lang];

    return (
        <main className="relative min-h-dvh bg-[#050505] text-white overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-20" />

            <nav className="relative z-50 p-6 md:p-12">
                <Link href={`/?lang=${lang}`} className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-cyan-500 hover:text-white transition-colors group">
                    <span className="w-6 h-[1px] bg-cyan-500 group-hover:bg-white transition-colors" />
                    {t.returnToOrbit}
                </Link>
            </nav>

            <section className="relative z-10 container mx-auto px-6 md:px-12 pb-10 md:pb-14 max-w-6xl">
                <div className="rounded-3xl border border-cyan-500/20 bg-black/35 backdrop-blur-md p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Image
                                src="/faviconwakato.png"
                                alt="WAKATO icon"
                                width={64}
                                height={64}
                                sizes="64px"
                                priority
                                className="h-16 w-16 rounded-2xl border border-cyan-400/30 bg-black/40 object-cover"
                            />
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">WAKATO</h1>
                                <p className="mt-1 text-cyan-300 text-sm md:text-base font-mono">{t.role}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[10px] font-mono tracking-[0.2em]">
                            <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-cyan-300">CLASS OF 2029</span>
                            <GeoLocationBadge />
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">{t.internship}</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-start gap-3 text-sm font-mono">
                        <div className="flex flex-col gap-3">
                            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <h2 className="text-cyan-300 text-xs tracking-widest mb-3">{t.sectionCareer}</h2>
                                <p className="text-gray-300 leading-relaxed">{t.careerText}</p>
                            </article>

                            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <h2 className="text-cyan-300 text-xs tracking-widest mb-3">{t.sectionAvailability}</h2>
                                <p className="text-gray-300 leading-relaxed">{t.availabilityText}</p>
                            </article>
                        </div>



                        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <h2 className="text-cyan-300 text-xs tracking-widest mb-3">{t.sectionAchievements}</h2>
                            <ul className="text-gray-300 space-y-2 leading-relaxed text-xs">
                                {t.achievements.map((item) => (
                                    <li key={item} className={item === '2026' ? 'pt-1 text-cyan-200' : undefined}>{item}</li>
                                ))}
                            </ul>
                        </article>

                        <div className="flex flex-col gap-3">
                            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <h2 className="text-cyan-300 text-xs tracking-widest mb-3">{t.sectionDev}</h2>
                                <p className="text-gray-300 leading-relaxed">{t.devText}</p>
                            </article>

                            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <h2 className="text-cyan-300 text-xs tracking-widest mb-3">{t.sectionStrengths}</h2>
                                <ul className="text-gray-300 space-y-2 leading-relaxed text-xs">
                                    {t.activities.map((item) => (
                                        <li key={item} className={item === '2026' ? 'pt-1 text-cyan-200' : undefined}>{item}</li>
                                    ))}
                                </ul>
                            </article>
                        </div>

                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <a
                            href="https://x.com/0ts_st"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-mono tracking-widest text-cyan-300 hover:bg-cyan-400 hover:text-black transition-colors"
                        >
                            X
                        </a>
                        <a
                            href="https://www.instagram.com/0ts_st/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-mono tracking-widest text-cyan-300 hover:bg-cyan-400 hover:text-black transition-colors"
                        >
                            Instagram
                        </a>
                        <a
                            href="https://github.com/nitr0yukkuri"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono tracking-widest text-gray-200 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="mailto:nakatawakato@gmail.com"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono tracking-widest text-gray-200 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
                        >
                            Contact
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
