import Scene from '@/components/canvas/Scene';
import { fetchPlanetData } from '@/lib/actions';
import ClientInitializer from '@/components/ClientInitializer';
import WorksList from '@/components/dom/WorksList';
import Link from 'next/link';

export default async function Home() {
  const data = await fetchPlanetData();

  const works = [
    { id: '01', title: 'GitHub Planet', cat: 'THREE.JS / VISUALIZATION', desc: 'Activity-based terrain generation' },
    { id: '02', title: 'おてんきぐらし', cat: 'NEXT.JS / PWA', desc: 'Weather-sync life simulation' },
    { id: '03', title: 'ColdKeep', cat: 'AI / IOT', desc: 'Audio-based volume estimation' },
  ];

  return (
    <main className="relative w-full min-h-[100dvh] text-white font-sans bg-[#050505]">
      <ClientInitializer
        initialWeather={data.weather as any}
        initialActivity={data.activityLevel}
      />

      {/* 3D Scene Background */}
      <div className="fixed inset-0 z-0 opacity-80 mix-blend-screen">
        <Scene />
      </div>

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-6 md:gap-0">
          {/* Bottom Left */}
          <div className="flex flex-col gap-1 border-l border-gray-800 pl-4 w-full md:w-auto opacity-50 hover:opacity-100 md:opacity-100 transition-opacity">
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
          <p className="text-2xl md:text-4xl font-light leading-snug text-gray-200">
            Webサイトを<br />
            「静的な情報の羅列」から<br />
            <span className="text-white font-normal border-b border-cyan-500/50">「呼吸する惑星」</span>へ。
          </p>
          <p className="mt-8 text-sm text-gray-500 leading-relaxed max-w-xl font-mono">
            GitHubの活動が地形を作り、現実の天気が空気を変える。<br />
            エンジニアとしての生存記録を有機的なデジタルアートへ昇華させる実験。
          </p>
        </section>

        {/* WORKS */}
        <section className="pt-32 pb-48 md:pb-32 bg-black/40 backdrop-blur-sm pointer-events-auto border-y border-white/5 relative z-40">
          <div className="container mx-auto px-6 md:px-20">
            <span className="text-cyan-500 text-xs font-mono mb-12 block">02 / SELECTED WORKS</span>

            <WorksList works={works} />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-24 px-6 md:px-20 bg-[#050505] pointer-events-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-6 text-white">LET'S CONNECT</h2>
              <div className="flex gap-8 font-mono text-xs text-gray-400">
                <a href="https://github.com/nitr0yukkuri" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">GITHUB</a>
                <a href="https://x.com/0ts_st" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">TWITTER</a>
                <a href="mailto:nakatawakato@gmail.com" className="hover:text-cyan-400 transition-colors">MAIL</a>
              </div>
            </div>
            <p className="text-[10px] text-gray-700 font-mono text-right">
              © 2026 WAKATO. ALL RIGHTS RESERVED.<br />
              DESIGNED IN OSAKA.
            </p>
          </div>
        </footer>

      </div>
    </main>
  );
}