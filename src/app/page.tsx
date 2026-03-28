import { fetchPlanetData } from '@/lib/actions';
import { Suspense } from 'react';
import ClientInitializer from '@/components/ClientInitializer';
import HomeBackgroundLayers from '@/components/HomeBackgroundLayers';
import WorksList from '@/components/dom/WorksList';
import WeatherDebugSelector from '@/components/dom/WeatherDebugSelector';
import TopLeftMenu from '../components/dom/TopLeftMenu';

type SupportedLang = 'ja' | 'en';

type SearchParams = {
  lang?: string | string[];
};

const copyByLang = {
  ja: {
    systemOnline: 'SYSTEM ONLINE',
    target: 'TARGET: NITR0YUKKURI',
    heroTagline: 'Code breathes with the atmosphere.',
    conceptLabel: '01 / CONCEPT',
    conceptLeadBefore: 'ポートフォリオを「情報リスト」から ',
    conceptLeadHighlight: '「体験」',
    conceptLeadAfter: 'へ。',
    conceptDesc: '大阪の実時間天気がホーム画面の空に反映される。3Dと動きで、スキルと作品を情報ではなく感覚で伝える。',
    worksLabel: '02 / SELECTED WORKS',
    canDoLabel: '03 / WHAT I CAN DO',
    askLabel: 'WHAT YOU CAN ASK',
    askItems: [
      'インタラクティブなLPやコーポレートサイト制作',
      '3D・アニメーション表現を活用した没入感のあるUI開発',
      'リアルタイム通信を使ったゲームやツール開発',
      'フロントからバックエンドまで一気通貫での開発',
      'IoT × AI を組み合わせたプロトタイプ・PoC開発',
    ],
    endSignal: '04 / END SIGNAL',
    footerText1: 'フロントエンド中心に、デザインからバックエンド連携まで一人で完結できます。',
    footerText2: '29卒・インターン・カジュアル面談、どこからでも歓迎です。',
    designedIn: 'DESIGNED IN OSAKA.',
    works: [
      { id: '01', title: 'GitHub Planet', cat: 'THREE.JS / VISUALIZATION', desc: 'GitHubのコミット数が、そのままリアルタイムで惑星の地形になる。コードを書くたびに地形が隆起する3Dビジュアライザー。' },
      { id: '02', title: 'おてんきぐらし', cat: 'NEXT.JS / PWA', desc: '今いる場所の天気が、アプリの世界に自動で反映される生活シミュレーション。雨は雨粒、雷はフラッシュ、雪は降雪モーションとして表現される。' },
      { id: '03', title: 'ColdKeep', cat: 'AI / IOT', desc: 'スマホのマイクで水筒の音を解析し、氷の有無・残量・温度を推定するAIアシスタント。' },
      { id: '04', title: 'reCAPTCHA Game', cat: 'REACT / GO / WEBSOCKET', desc: '60秒以内に何回「人間」を証明できる？対戦型認証ゲーム。' },
      { id: '05', title: 'でんしょうお', cat: 'REACT / SUPABASE', desc: '小さな幸せを魚に乗せて流す、癒しと分かち合いのSNS。' },
    ],
  },
  en: {
    systemOnline: 'SYSTEM ONLINE',
    target: 'TARGET: NITR0YUKKURI',
    heroTagline: 'Code breathes with the atmosphere.',
    conceptLabel: '01 / CONCEPT',
    conceptLeadBefore: 'From a static list of information to a ',
    conceptLeadHighlight: 'breathing planet',
    conceptLeadAfter: '.',
    conceptDesc: 'GitHub activity shapes terrain, and real-world weather changes the atmosphere. A living experiment that transforms my engineering record into organic digital art.',
    worksLabel: '02 / SELECTED WORKS',
    canDoLabel: '03 / WHAT I CAN DO',
    askLabel: 'WHAT YOU CAN ASK',
    askItems: [
      'Interactive LP and corporate website development',
      'Immersive UI development with 3D and animation expression',
      'Game and tool development using real-time communication',
      'End-to-end development from frontend to backend',
      'Prototype and PoC development combining IoT and AI',
    ],
    endSignal: '04 / END SIGNAL',
    footerText1: 'Primarily frontend, and I can deliver solo from design to backend integration.',
    footerText2: 'Class of 2029. Internships and casual chats are always welcome.',
    designedIn: 'DESIGNED IN OSAKA.',
    works: [
      { id: '01', title: 'GitHub Planet', cat: 'THREE.JS / VISUALIZATION', desc: 'A 3D visualizer where GitHub commit count becomes planetary terrain in real time. Each line of code uplifts the landscape.' },
      { id: '02', title: 'Otenkigurashi', cat: 'NEXT.JS / PWA', desc: 'A lifestyle simulation where local weather is reflected directly into the app world: rain droplets, thunder flashes, and snow motions.' },
      { id: '03', title: 'ColdKeep', cat: 'AI / IOT', desc: 'An AI assistant that analyzes bottle sounds from a smartphone mic to estimate ice presence, remaining amount, and temperature.' },
      { id: '04', title: 'reCAPTCHA Game', cat: 'REACT / GO / WEBSOCKET', desc: 'How many times can you prove you are human in 60 seconds? A competitive authentication game.' },
      { id: '05', title: 'Denshouo', cat: 'REACT / SUPABASE', desc: 'A gentle SNS where small happiness is sent away on fish, made for healing and sharing.' },
    ],
  },
} as const;

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const data = await fetchPlanetData();
  const resolvedSearchParams = (await searchParams) ?? {};
  const langParam = Array.isArray(resolvedSearchParams.lang)
    ? resolvedSearchParams.lang[0]
    : resolvedSearchParams.lang;
  const lang: SupportedLang = langParam === 'en' ? 'en' : 'ja';
  const t = copyByLang[lang];

  const works = t.works.map((work) => ({ ...work }));

  return (
    <main className="relative w-full min-h-[100dvh] text-white font-sans bg-[#050505]">
      <ClientInitializer
        initialWeather={data.weather as any}
        initialActivity={data.activityLevel}
      />

      <HomeBackgroundLayers />

      {/* === FIXED HUD UI === */}
      <div className="fixed inset-0 z-50 pointer-events-none p-6 md:p-8 flex flex-col justify-between text-xs font-mono tracking-widest text-gray-500">
        {/* Top Left */}
        <Suspense fallback={null}>
          <TopLeftMenu />
        </Suspense>

        {/* Top Right */}
        <div className="absolute top-6 right-4 sm:right-6 md:right-8 text-right flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono tracking-widest text-gray-400">
            <a href="/?lang=ja" className={lang === 'ja' ? 'text-cyan-300' : 'hover:text-gray-200 transition-colors'}>JP</a>
            <span className="text-gray-700">/</span>
            <a href="/?lang=en" className={lang === 'en' ? 'text-cyan-300' : 'hover:text-gray-200 transition-colors'}>ENG</a>
          </div>
        </div>

        {/* Bottom HUD Container */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-6 md:gap-0 pointer-events-none">
          {/* Bottom Left */}
          <div className="flex flex-col gap-1 w-full md:w-auto opacity-50 hover:opacity-100 md:opacity-100 transition-opacity pointer-events-none md:pointer-events-auto">
            <div className="flex flex-col gap-1 border-l border-gray-800 pl-4">
              <div className="flex gap-4">
                <span className="w-12">LOC</span>
                <span className="text-gray-300">OSAKA, JP</span>
              </div>
              <div className="flex gap-4">
                <span className="w-12">WTHR</span>
                <span className={data.weather === 'Rain' ? 'text-blue-400' : 'text-orange-400'}>
                  {data.weather.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-4">
                <span className="w-12">ACTV</span>
                <span className="text-white">{(data.activityLevel * 100).toFixed(0)}%</span>
              </div>
            </div>
            <WeatherDebugSelector />
          </div>

        </div>
      </div>

      {/* === SCROLLABLE CONTENT === */}
      <div className="relative z-10 w-full pointer-events-none">

        {/* HERO */}
        <section className="h-[100dvh] min-h-[100dvh] flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 md:space-y-6">
            <h2 className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-80">
              LIVING<br />PLANET
            </h2>
            <p className="text-sm md:text-base text-gray-400 font-mono">
              {t.heroTagline}
            </p>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="py-32 px-6 md:px-20 max-w-4xl mx-auto pointer-events-auto">
          <span className="text-cyan-500 text-xs font-mono mb-8 block">{t.conceptLabel}</span>
          <p className="max-w-3xl text-2xl md:text-4xl font-light leading-[1.35] text-gray-200 text-balance">
            {t.conceptLeadBefore}<span className="text-white font-normal border-b border-cyan-500/50">{t.conceptLeadHighlight}</span>{t.conceptLeadAfter}
          </p>
          <p className="mt-8 text-sm text-gray-500 leading-relaxed max-w-2xl font-mono text-pretty">
            {t.conceptDesc}
          </p>
        </section>

        {/* WORKS */}
        <section className="pt-32 pb-48 md:pb-32 bg-black/40 backdrop-blur-sm pointer-events-auto border-y border-white/5 relative z-40">
          <div className="container mx-auto px-6 md:px-20">
            <span className="text-cyan-500 text-xs font-mono mb-12 block">{t.worksLabel}</span>

            <WorksList works={works} />
          </div>
        </section>

        {/* SKILLS & CAN DO */}
        <section className="py-24 px-6 md:px-20 pointer-events-auto">
          <div className="max-w-5xl mx-auto">
            <span className="text-cyan-500 text-xs font-mono mb-12 block">{t.canDoLabel}</span>

            <div className="relative grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="hidden md:block pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 h-[92%] w-px bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent" />

              {/* Left: Tech Stack */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
                <h3 className="text-sm font-mono tracking-widest text-gray-400 mb-6 border-l border-cyan-500 pl-4">TECH STACK</h3>
                <div className="space-y-4 font-mono text-xs">
                  {([
                    { label: 'Frontend', items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'] },
                    { label: '3D / Creative', items: ['Three.js', 'WebGL', 'GLSL', 'Framer Motion'] },
                    { label: 'Backend', items: ['Node.js', 'Go', 'PostgreSQL', 'Supabase'] },
                    { label: 'Other', items: ['WebSocket', 'Docker', 'PWA', 'Figma'] },
                  ] as { label: string; items: string[] }[]).map(({ label, items }) => (
                    <div key={label} className="flex gap-4 items-start">
                      <span className="text-gray-600 w-24 shrink-0 pt-0.5">{label}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map(item => (
                          <span key={item} className="border border-white/10 bg-white/5 px-2 py-0.5 rounded text-gray-300">{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: What you can ask + Awards */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
                <h3 className="text-sm font-mono tracking-widest text-gray-400 mb-6 border-l border-cyan-500 pl-4">{t.askLabel}</h3>
                <ul className="space-y-3 font-mono text-sm text-gray-300">
                  {t.askItems.map((item, i) => (
                    <li key={i} className="grid grid-cols-[auto_1fr] gap-3 items-start rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors">
                      <span className="text-cyan-500 leading-6">→</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <h3 className="text-xs font-mono tracking-widest text-gray-600 mb-4">AWARDS</h3>
                  <ul className="space-y-2 font-mono text-xs text-gray-400">
                    <li><span className="text-yellow-400">★ {lang === 'en' ? 'Grand Prize' : '最優秀賞'}</span> — {lang === 'en' ? 'GeekCamp Vol.19 / Umeda TechBase' : '技育CAMP Vol.19 / うめきたTechBase'}</li>
                    <li><span className="text-yellow-400">★ {lang === 'en' ? 'Excellence Award' : '優秀賞'}</span> — {lang === 'en' ? 'GeekCamp Vol.10, Vol.14' : '技育CAMP Vol.10, Vol.14'}</li>
                    <li><span className="text-orange-400">◆ {lang === 'en' ? 'Finalist' : '決勝進出'}</span> — {lang === 'en' ? 'Heroes League 2025' : 'ヒーローズ・リーグ 2025'}</li>
                    <li><span className="text-cyan-300">◆ {lang === 'en' ? 'Corporate Award' : '企業賞'}</span> — {lang === 'en' ? 'Geek Expo Vol.6 (WingArc 1st)' : '技育博 Vol.6（ウイングアーク１ｓｔ）'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-24 px-6 md:px-20 bg-[#050505] pointer-events-auto border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div>
                <span className="text-cyan-500 text-xs font-mono tracking-[0.28em]">{t.endSignal}</span>
                <p className="mt-4 text-sm md:text-base text-gray-400 leading-relaxed font-mono max-w-xl">
                  {t.footerText1}<br />
                  {t.footerText2}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://x.com/0ts_st"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-mono tracking-widest text-cyan-300 hover:bg-cyan-400 hover:text-black transition-colors"
                  >
                    X / Twitter
                  </a>
                  <a
                    href="mailto:nakatawakato@gmail.com"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono tracking-widest text-gray-200 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
                  >
                    CONTACT
                  </a>
                  <a
                    href="https://github.com/nitr0yukkuri"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono tracking-widest text-gray-200 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
                  >
                    GitHub
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-gray-700 font-mono text-left md:text-right">
                © 2026 WAKATO. ALL RIGHTS RESERVED.<br />
                {t.designedIn}
              </p>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}