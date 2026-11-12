import type { Metadata } from 'next';

export type SiteLang = 'ja' | 'en';
export type LocaleParams = { lang?: string | string[] };
export type SeoPageProps = { searchParams?: Promise<LocaleParams> };
export const SITE_URL = 'https://wakato.tech';
export const profiles = ['https://github.com/nitr0yukkuri', 'https://x.com/0ts_st', 'https://www.instagram.com/0ts_st/'];

export const seoPages = {
    home: {
        path: '/', name: { ja: 'WAKATO | Living Planet', en: 'WAKATO | Living Planet' },
        title: { ja: 'WAKATO（わかと）| Living Planet — 3Dポートフォリオ', en: 'WAKATO | Living Planet — Creative Developer & 3D Portfolio' },
        description: {
            ja: 'WAKATO（わかと）の個人ポートフォリオ。Three.js・React Three Fiber・WebGL・GLSLで、天候・季節・時間帯が息づく3D体験と作品を紹介。CSS Winner Site of the Day受賞。',
            en: 'WAKATO’s immersive portfolio, built with Three.js, React Three Fiber, WebGL and GLSL. Explore projects in a world shaped by weather, seasons and time. CSS Winner Site of the Day.',
        },
    },
    about: {
        path: '/about', name: { ja: 'WAKATOについて', en: 'About WAKATO' },
        title: { ja: 'WAKATO（わかと）について | 経歴・技術・実績', en: 'About WAKATO | Software Engineer & Creative Developer' },
        description: {
            ja: 'WAKATO（わかと）のプロフィール。ECCコンピュータ専門学校在学。3D・WebGLによる体験設計から、Node.js・GoのAPI、PostgreSQL、デプロイまで。経歴・技術スタック・受賞実績を紹介します。',
            en: 'Meet WAKATO, a software engineer and creative developer studying at ECC Computer College. Explore experience, awards and work across 3D WebGL interfaces, Node.js, Go, PostgreSQL and deployment.',
        },
    },
    'github-planet': {
        path: '/github-planet', name: { ja: 'GitHub Planet', en: 'GitHub Planet' },
        title: { ja: 'GitHub Planet | GitHubの活動を惑星にする3D作品 — WAKATO', en: 'GitHub Planet | A 3D Visualization of GitHub Activity — WAKATO' },
        description: { ja: 'GitHubの活動を宇宙に浮かぶ惑星として可視化するGitHub Planet。言語ごとの地表、シェーダー、リアルタイムの流星など、Three.jsによる作品のコンセプトと技術を紹介します。', en: 'Explore GitHub Planet, a Three.js project that turns GitHub activity into planets. Discover language-specific surfaces, shaders and real-time meteors, with the concept and technical details.' },
    },
    otenkigurashi: {
        path: '/otenkigurashi', name: { ja: 'おてんきぐらし', en: 'Otenkigurashi' },
        title: { ja: 'おてんきぐらし | 天気と暮らす生活シミュレーション — WAKATO', en: 'Otenkigurashi | A Weather-Connected Life Simulation — WAKATO' },
        description: { ja: '今いる場所の天気がアプリの世界に反映される「おてんきぐらし」。雨・雪・雷や季節の演出、キャラクターとの暮らしを紹介する、Next.js・PWA作品の詳細ページです。', en: 'Otenkigurashi is a Next.js and PWA life simulation connected to local weather. Explore its character, rain, snow, thunder and seasonal interactions, along with the project’s features and technology.' },
    },
    coldkeep: {
        path: '/coldkeep', name: { ja: 'ColdKeep', en: 'ColdKeep' },
        title: { ja: 'ColdKeep | 水筒の振り音で残量推定を目指すAIプロトタイプ — WAKATO', en: 'ColdKeep | An Experimental Audio-Based Bottle Assistant — WAKATO' },
        description: { ja: '水筒を振る音で残量の3段階推定を目指す実験的AIプロトタイプ、ColdKeep。React Native・TypeScript、Android録音、音響特徴量とモデルの設計、未学習・低信頼度時の扱いを紹介します。', en: 'ColdKeep is an experimental AI prototype exploring three-level bottle fill estimation from shaking sounds. Discover its React Native interface, Android recording, audio features and model-readiness safeguards.' },
    },
    'recaptcha-game': {
        path: '/recaptcha-game', name: { ja: 'reCAPTCHA Game', en: 'reCAPTCHA Game' },
        title: { ja: 'reCAPTCHA Game | 画像認証モチーフのリアルタイム対戦ゲーム — WAKATO', en: 'reCAPTCHA Game | Real-Time Image Verification Battles — WAKATO' },
        description: { ja: '画像認証をモチーフにしたreCAPTCHA Game。9枚のパネルを選ぶCPU戦・オンライン対戦、コンボと妨害演出を、React・Go・WebSocketで構成した作品を紹介します。', en: 'A competitive game inspired by image verification. Explore CPU and online battles across nine panels, combos and interference effects, built with React, Go and WebSocket.' },
    },
    denshouo: {
        path: '/denshouo', name: { ja: 'でんしょうお', en: 'Denshouo' },
        title: { ja: 'でんしょうお | 小さな幸せを魚に乗せるSNS — WAKATO', en: 'Denshouo | Sharing Small Moments of Happiness — WAKATO' },
        description: { ja: '小さな幸せを魚に乗せて流すSNS「でんしょうお」。React・Supabaseによる作品のコンセプト、光と影を使った水中表現、コミュニケーションの設計を紹介します。', en: 'Denshouo is a gentle social app where fish carry small moments of happiness. Explore the React and Supabase project, its underwater atmosphere and approach to communication.' },
    },
} as const;
export type SeoPage = keyof typeof seoPages;

export function getLang(params: LocaleParams = {}): SiteLang {
    const value = Array.isArray(params.lang) ? params.lang[0] : params.lang;
    return value === 'en' ? 'en' : 'ja';
}

// Japanese keeps the existing bare URL. Presentation/debug parameters are not identity.
export function localizedPath(path: string, lang: SiteLang): string {
    return `${path}${lang === 'en' ? '?lang=en' : ''}`;
}

export function pageUrl(page: SeoPage, lang: SiteLang): string {
    return new URL(localizedPath(seoPages[page].path, lang), SITE_URL).href;
}

export async function getPageMetadata(page: SeoPage, searchParams?: Promise<LocaleParams>): Promise<Metadata> {
    const lang = getLang(await searchParams);
    const item = seoPages[page];
    return {
        title: { absolute: item.title[lang] }, description: item.description[lang],
        alternates: { canonical: pageUrl(page, lang), languages: { ja: pageUrl(page, 'ja'), en: pageUrl(page, 'en'), 'x-default': pageUrl(page, 'ja') } },
        openGraph: { type: 'website', title: item.title[lang], description: item.description[lang], url: pageUrl(page, lang), siteName: 'WAKATO | Living Planet', locale: lang === 'en' ? 'en_US' : 'ja_JP', alternateLocale: lang === 'en' ? 'ja_JP' : 'en_US', images: [{ url: `${SITE_URL}/opengraph-image.png`, width: 1200, height: 630, alt: 'WAKATO | Living Planet — immersive 3D portfolio' }] },
        twitter: { card: 'summary_large_image', title: item.title[lang], description: item.description[lang], creator: '@0ts_st', images: [`${SITE_URL}/opengraph-image.png`] },
    };
}
