import Scene from '@/components/canvas/Scene';
import { fetchPlanetData } from '@/lib/actions';
import ClientInitializer from '@/components/ClientInitializer';

export default async function Home() {
  const data = await fetchPlanetData();

  const works = [
    { id: '01', title: 'GitHub Planet', cat: 'THREE.JS / VISUALIZATION', desc: 'Activity-based terrain generation' },
    { id: '02', title: 'Otenki Gurashi', cat: 'NEXT.JS / PWA', desc: 'Weather-sync life simulation' },
    { id: '03', title: 'ColdKeep', cat: 'AI / IOT', desc: 'Audio-based volume estimation' },
  ];

  return (
    <main className="relative w-full min-h-screen text-white font-sans bg-[#050505]">
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
        <div className="flex flex-col gap-2">
          <h1 className="text-white font-bold text-sm tracking-tighter">WAKATOPO</h1>
          <p>IMMERSIVE PORTFOLIO</p>
        </div>

        {/* Top Right */}
        <div className="absolute top-8 right-8 text-right flex flex-col gap-1">
          <div className="flex items-center justify-end gap-2 text-cyan-400">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-none animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
          <span>TARGET: NITR0YUKKURI</span>
        </div>

        {/* Bottom Left */}
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

        {/* Bottom Right */}
        <div className="text-right flex flex-col items-end gap-2">
          <span>SCROLL TO EXPLORE</span>
          <div className="w-[1px] h-8 bg-gray-600"></div>
        </div>
      </div>

      {/* === SCROLLABLE CONTENT === */}
      <div className="relative z-10 w-full">

        {/* HERO */}
        <section className="h-screen flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-6">
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
        <section className="py-32 bg-black/40 backdrop-blur-sm pointer-events-auto border-y border-white/5">
          <div className="container mx-auto px-6 md:px-20">
            <span className="text-cyan-500 text-xs font-mono mb-12 block">02 / SELECTED WORKS</span>

            <div className="flex flex-col">
              {works.map((work) => (
                <div key={work.id} className="group relative border-t border-white/10 py-12 flex flex-col md:flex-row md:items-baseline justify-between transition-colors hover:bg-white/5 cursor-pointer">
                  <span className="font-mono text-xs text-gray-600 mb-2 md:mb-0 w-16 group-hover:text-cyan-400 transition-colors">
                    {work.id}
                  </span>

                  <h3 className="text-3xl md:text-5xl font-bold text-gray-300 group-hover:text-white transition-colors flex-1">
                    {work.title}
                  </h3>

                  <div className="mt-4 md:mt-0 md:text-right">
                    <div className="text-[10px] font-mono text-cyan-500/80 mb-1 tracking-wider uppercase">
                      {work.cat}
                    </div>
                    <div className="text-sm text-gray-500 group-hover:text-gray-400">
                      {work.desc}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-white/10" />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-24 px-6 md:px-20 bg-[#050505] pointer-events-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-6 text-white">LET'S CONNECT</h2>
              <div className="flex gap-8 font-mono text-xs text-gray-400">
                <a href="https://github.com/nitr0yukkuri" target="_blank" className="hover:text-cyan-400 transition-colors">GITHUB</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">TWITTER</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">MAIL</a>
              </div>
            </div>
            <p className="text-[10px] text-gray-700 font-mono text-right">
              © 2026 WAKATO NAKATA.<br />
              DESIGNED IN OSAKA.
            </p>
          </div>
        </footer>

      </div>
    </main>
  );
}