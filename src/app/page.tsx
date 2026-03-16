import Scene from '@/components/canvas/Scene';
import { fetchPlanetData } from '@/lib/actions';
import ClientInitializer from '@/components/ClientInitializer';
import WorksList from '@/components/dom/WorksList';
import WeatherDebugSelector from '@/components/dom/WeatherDebugSelector';
import WeatherEffectsOverlay from '@/components/dom/WeatherEffectsOverlay';
import Link from 'next/link';

export default async function Home() {
  const data = await fetchPlanetData();

  const works = [
    { id: '01', title: 'GitHub\u00A0Planet', cat: 'THREE.JS / VISUALIZATION', desc: 'GitHubのコミット数が、そのままリアルタイムで惑星の地形になる。コードを書くたびに地形が隆起する3Dビジュアライザー。' },
    { id: '02', title: 'おてんきぐらし', cat: 'NEXT.JS / PWA', desc: '今いる場所の天気が、アプリの世界に自動で反映される生活シミュレーション。雨は雨粒、雷はフラッシュ、雪は降雪モーションとして表現される。' },
    { id: '03', title: 'ColdKeep', cat: 'AI / IOT', desc: 'スマホのマイクで水筒の音を解析し、氷の有無・残量・温度を推定するAIアシスタント。' },
    { id: '04', title: 'reCAPTCHA\u00A0Game', cat: 'REACT / GO / WEBSOCKET', desc: '60秒以内に何回「人間」を証明できる？対戦型認証ゲーム。' },
    { id: '05', title: 'でんしょうお', cat: 'REACT / SUPABASE', desc: '小さな幸せを魚に乗せて流す、癒しと分かち合いのSNS。' },
  ];

  return (
    <main className="relative w-full min-h-[100dvh] text-white font-sans bg-[#050505]">
      <ClientInitializer
        initialWeather={data.weather as any}
        initialActivity={data.activityLevel}
      />

      {/* 3D Scene Background */}
      <div className="fixed inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none md:pointer-events-auto">
        <Scene />
      </div>

      {/* Weather Effects Overlay */}
      <WeatherEffectsOverlay />

      {/* === FIXED HUD UI === */}
      <div className="fixed inset-0 z-50 pointer-events-none p-6 md:p-8 flex flex-col justify-between text-xs font-mono tracking-widest text-gray-500">
        {/* Top Left */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <Link href="/about" className="group block">
            <h1 className="text-white font-bold text-sm tracking-widest group-hover:text-cyan-400 transition-colors cursor-pointer">
              WAKATO <span className="text-cyan-500 group-hover:text-white transition-colors">//</span> PORTFOLIO
            </h1>
          </Link>
          <p className="opacity-70 pointer-events-none">INTERACTIVE WEB EXPERIENCE</p>
        </div>

        {/* Top Right */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 text-right flex flex-col gap-1">
          <div className="flex items-center justify-end gap-2 text-cyan-400">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-none animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
          <span className="hidden sm:inline">TARGET: NITR0YUKKURI</span>
        </div>

        {/* Bottom HUD Container */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-6 md:gap-0 pointer-events-none">
          {/* Bottom Left */}
          <div className="flex flex-col gap-1 w-full md:w-auto opacity-50 hover:opacity-100 md:opacity-100 transition-opacity pointer-events-auto">
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

          {/* Bottom Right */}
          <div className="hidden sm:flex text-right flex-col items-end gap-2">
            <span>SCROLL TO EXPLORE</span>
            <div className="w-[1px] h-8 bg-gray-600"></div>
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
              Code breathes with the atmosphere.
            </p>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="py-32 px-6 md:px-20 max-w-4xl mx-auto pointer-events-auto">
          <span className="text-cyan-500 text-xs font-mono mb-8 block">01 / CONCEPT</span>
          <p className="max-w-3xl text-2xl md:text-4xl font-light leading-[1.35] text-gray-200 text-balance">
            Webサイトを「静的な情報の羅列」から <span className="text-white font-normal border-b border-cyan-500/50">「呼吸する惑星」</span>へ。
          </p>
          <p className="mt-8 text-sm text-gray-500 leading-relaxed max-w-2xl font-mono text-pretty">
            GitHubの活動が地形を作り、現実の天気が空気を変える。エンジニアとしての生存記録を有機的なデジタルアートへ昇華させる実験。
          </p>
        </section>

        {/* WORKS */}
        <section className="pt-32 pb-48 md:pb-32 bg-black/40 backdrop-blur-sm pointer-events-auto border-y border-white/5 relative z-40">
          <div className="container mx-auto px-6 md:px-20">
            <span className="text-cyan-500 text-xs font-mono mb-12 block">02 / SELECTED WORKS</span>

            <WorksList works={works} />
          </div>
        </section>

        {/* SKILLS & CAN DO */}
        <section className="py-24 px-6 md:px-20 pointer-events-auto">
          <div className="max-w-5xl mx-auto">
            <span className="text-cyan-500 text-xs font-mono mb-12 block">03 / WHAT I CAN DO</span>

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
                <h3 className="text-sm font-mono tracking-widest text-gray-400 mb-6 border-l border-cyan-500 pl-4">WHAT YOU CAN ASK</h3>
                <ul className="space-y-3 font-mono text-sm text-gray-300">
                  {[
                    'インタラクティブなLPやコーポレートサイト制作',
                    '3D・アニメーション表現を活用した没入感のあるUI開発',
                    'リアルタイム通信を使ったゲームやツール開発',
                    'フロントからバックエンドまで一気通貫での開発',
                    'IoT × AI を組み合わせたプロトタイプ・PoC開発',
                  ].map((item, i) => (
                    <li key={i} className="grid grid-cols-[auto_1fr] gap-3 items-start rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors">
                      <span className="text-cyan-500 leading-6">→</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <h3 className="text-xs font-mono tracking-widest text-gray-600 mb-4">AWARDS</h3>
                  <ul className="space-y-2 font-mono text-xs text-gray-400">
                    <li><span className="text-yellow-400">★ 最優秀賞</span> — 技育CAMP Vol.19 / うめきたTechBase</li>
                    <li><span className="text-yellow-400">★ 優秀賞</span> — 技育CAMP Vol.10, Vol.14</li>
                    <li><span className="text-orange-400">◆ 決勝進出</span> — ヒーローズ・リーグ 2025</li>
                    <li><span className="text-cyan-300">◆ 企業賞</span> — 技育博 Vol.6（ウイングアーク１ｓｔ）</li>
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
                <span className="text-cyan-500 text-xs font-mono tracking-[0.28em]">04 / END SIGNAL</span>
                <p className="mt-4 text-sm md:text-base text-gray-400 leading-relaxed font-mono max-w-xl">
                  フロントエンド中心に、デザインからバックエンド連携まで一人で完結できます。<br />
                  29卒・インターン・カジュアル面談、どこからでも歓迎です。
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
                DESIGNED IN OSAKA.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}