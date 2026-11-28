import Link from 'next/link';
import ProjectLinks from '@/components/ProjectLinks';
import SeoJsonLd from '@/components/SeoJsonLd';
import { getLang, getPageMetadata, type SeoPageProps } from '@/lib/seo';
import type { CSSProperties } from 'react';
import HoshirubeBackground from './HoshirubeBackground';
import HoshirubeConstellation from './HoshirubeConstellation';
import styles from './hoshirube.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: SeoPageProps) {
    return getPageMetadata('hoshirube', searchParams);
}

const content = {
    ja: {
        eyebrow: 'BOOK DISCOVERY / HACK STAGE｜GROST',
        tagline: <>本を通して、<br />まだ知らない<span>「好き」</span>に出会おう。</>,
        intro: '興味の種から、となりの世界へ。ジャンルのつながりを星座としてたどり、新しい本と出会う読書探索プロジェクト。',
        mapLabel: 'A MAP OF CONNECTED WORLDS',
        mapTitle: '読書を重ねると、星が星座になる。',
        mapDescription: '哲学、文学、科学、ものづくり。最初は独立した星として並び、読書履歴に応じてジャンル間のつながりが加わる。',
        mapCaption: 'ほしるべの初期表示。読書に応じて星座の線が加わる。',
        conceptLabel: 'THE IDEA',
        conceptTitle: <>「次に読む本」から、<br />「次に好きになるもの」へ。</>,
        conceptBody: '本を探すとき、知らないジャンルは検索語にすらなりにくい。ほしるべは、興味や読書の好みを入口に、ジャンル同士のつながりを見せる。いま気になっている星の隣に、まだ知らない世界が見つかる。',
        stepsLabel: 'HOW TO EXPLORE',
        stepsTitle: '興味をたどる、3つのステップ',
        steps: [
            ['01', '興味の種を選ぶ', '気になるテーマや、読書で大切にしたいことを選択。'],
            ['02', '星座をひらく', 'つながったジャンルを星の地図からたどり、気になる世界を見つける。'],
            ['03', '本に出会う', 'ひらいた世界の本を見ながら、次に読みたい一冊を探す。'],
        ],
        awardLabel: 'HACK STAGE｜GROST vol.1',
        awardTitle: '優秀賞',
        awardNote: '本をきっかけに、興味の世界を広げるプロジェクト。',
        projectLabel: 'EXPLORE THE PROJECT',
        projectTitle: '星座の先にある本を、見に行く。',
        projectBody: 'ほしるべの実装やプロジェクトの詳細は、GitHubリポジトリで確認できます。',
        github: 'GitHubリポジトリを見る',
        back: 'ポートフォリオへ戻る',
        worlds: ['哲学', '歴史', '社会', '自然科学', 'テクノロジー', 'ものづくり', '芸術', '言語', '文学'],
    },
    en: {
        eyebrow: 'BOOK DISCOVERY / HACK STAGE｜GROST',
        tagline: <>Find a new <span>favorite</span><br />through books.</>,
        intro: 'Follow the constellations between your interests and discover new fields, new books, and the curiosity next door.',
        mapLabel: 'A MAP OF CONNECTED WORLDS',
        mapTitle: 'As you read, the stars begin to connect.',
        mapDescription: 'Philosophy, literature, science, and making begin as separate stars. Connections appear between themes as your reading history grows.',
        mapCaption: 'Hoshirube’s initial map. Connections appear through reading activity.',
        conceptLabel: 'THE IDEA',
        conceptTitle: <>From the next book<br />to your next favorite thing.</>,
        conceptBody: 'When looking for a book, an unfamiliar field may never make it into the search terms. Hoshirube starts from your interests and reading preferences, then makes the connections between fields visible. A new world may be waiting beside the star you already know.',
        stepsLabel: 'HOW TO EXPLORE',
        stepsTitle: 'Three steps to follow your curiosity',
        steps: [
            ['01', 'Choose a starting point', 'Select themes and the kind of reading experience you enjoy.'],
            ['02', 'Open the constellation', 'Trace connected fields across a map of stars and find a world to explore.'],
            ['03', 'Meet a new book', 'Browse books in that world and find your next read.'],
        ],
        awardLabel: 'HACK STAGE｜GROST vol.1',
        awardTitle: 'Excellence Award',
        awardNote: 'A project that uses books to open up new worlds of interest.',
        projectLabel: 'EXPLORE THE PROJECT',
        projectTitle: 'Find the books beyond the stars.',
        projectBody: 'Explore the implementation and project details in the GitHub repository.',
        github: 'View GitHub repository',
        back: 'Back to portfolio',
        worlds: ['Philosophy', 'History', 'Society', 'Natural science', 'Technology', 'Making', 'Arts', 'Language', 'Literature'],
    },
} as const;

export default async function HoshirubePage({ searchParams }: SeoPageProps) {
    const lang = getLang(await searchParams);
    const t = content[lang];

    return (
        <>
            <SeoJsonLd page="hoshirube" lang={lang} />
            <HoshirubeBackground />
            <main lang={lang} className={styles.page}>
                <section className={styles.hero}>
                    <div className={styles.earth} aria-hidden="true" />
                    <div className={styles.heroInner}>
                        <div className={styles.heroCopy}>
                            <p className={styles.eyebrow}><span className={styles.eyebrowDot} />{t.eyebrow}</p>
                            <p className={styles.heroIndex}>06 <span>/</span> PROJECT</p>
                            <h1 className={styles.title}>ほしるべ<span className={styles.titleRoman}>HOSHIRUBE</span></h1>
                            <p className={styles.tagline}>{t.tagline}</p>
                            <p className={styles.intro}>{t.intro}</p>
                            <a className={styles.textLink} href="#concept">{lang === 'ja' ? 'プロジェクトを知る' : 'Discover the project'}</a>
                        </div>
                        <div className={styles.heroVisual}>
                            <div className={styles.visualMeta}><span>09 MAIN WORLDS</span><span>LINES GROW WITH READING</span></div>
                            <figure className={styles.mapFigure}>
                                <HoshirubeConstellation lang={lang} />
                                <figcaption className={styles.mapCaption}>{t.mapCaption}</figcaption>
                            </figure>
                            <div className={styles.visualFoot}><span className={styles.liveDot} />{t.mapLabel}</div>
                        </div>
                    </div>
                    <p className={styles.scrollHint}>{lang === 'ja' ? 'スクロールして星をたどる' : 'SCROLL TO EXPLORE'}</p>
                </section>

                <section id="concept" className={styles.conceptSection}>
                    <div className={styles.sectionHead}>
                        <p className={styles.sectionLabel}>01 <span>/</span> {t.conceptLabel}</p>
                        <h2>{t.conceptTitle}</h2>
                    </div>
                    <div className={styles.conceptCopy}>
                        <p>{t.conceptBody}</p>
                    </div>
                </section>

                <section className={styles.mapSection}>
                    <div className={styles.mapSectionHead}>
                        <div>
                            <p className={styles.sectionLabel}>02 <span>/</span> {t.mapLabel}</p>
                            <h2>{t.mapTitle}</h2>
                        </div>
                        <p>{t.mapDescription}</p>
                    </div>
                    <div className={styles.mapCard}>
                        <div className={styles.worldLegend} aria-label={lang === 'ja' ? 'ジャンル一覧' : 'Theme list'}>
                            {t.worlds.map((world) => <span key={world}>{world}</span>)}
                        </div>
                    </div>
                </section>

                <section className={styles.stepsSection}>
                    <div className={styles.sectionHead}>
                        <p className={styles.sectionLabel}>03 <span>/</span> {t.stepsLabel}</p>
                        <h2>{t.stepsTitle}</h2>
                    </div>
                    <div className={styles.stepsGrid}>
                        {t.steps.map(([number, title, description], index) => (
                            <article className={styles.step} key={number}>
                                <div className={styles.stepTop}><span>{number}</span><span className={styles.stepStar} style={{ '--step-delay': `${index * 180}ms` } as CSSProperties} /></div>
                                <h3>{title}</h3>
                                <p>{description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.awardSection} aria-label={lang === 'ja' ? '受賞実績' : 'Award'}>
                    <div className={styles.awardGlyph} aria-hidden="true">✳</div>
                    <div className={styles.awardCopy}><p className={styles.sectionLabel}>{t.awardLabel}</p><h2>{t.awardTitle}</h2><p>{t.awardNote}</p></div>
                    <p className={styles.awardYear}>2026</p>
                </section>

                <section className={styles.projectSection}>
                    <p className={styles.sectionLabel}>04 <span>/</span> {t.projectLabel}</p>
                    <h2>{t.projectTitle}</h2>
                    <p className={styles.projectBody}>{t.projectBody}</p>
                    <div className={styles.projectActions}>
                        <a className={styles.primaryLink} href="https://github.com/nitr0yukkuri/HACKSTAGE_GROST" target="_blank" rel="noreferrer">{t.github}</a>
                        <Link className={styles.secondaryLink} href={lang === 'en' ? '/?lang=en' : '/'}>{t.back}</Link>
                    </div>
                </section>
            </main>
            <ProjectLinks page="hoshirube" lang={lang} />
        </>
    );
}

