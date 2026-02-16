import Scene from '@/components/canvas/Scene';
import { fetchPlanetData } from '@/lib/actions';
import ClientInitializer from '@/components/ClientInitializer';

export default async function Home() {
  // サーバーサイドでデータ取得
  const data = await fetchPlanetData();

  return (
    <main className="relative w-full min-h-screen text-white font-mono selection:bg-cyan-500/30 bg-slate-950">
      {/* データをクライアントストアに注入（表示なし） */}
      <ClientInitializer
        initialWeather={data.weather as any}
        initialActivity={data.activityLevel}
      />

      {/* 3D Scene Background (Fixed) */}
      {/* z-0 に配置し、画面全体に固定。余白部分のイベントはCanvasが受け取る */}
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>

      {/* Scrollable Overlay Content */}
      {/* z-10 で手前に配置。コンテンツ以外はクリック透過(pointer-events-none)させるのがコツ */}
      <div className="relative z-10 w-full h-full">

        {/* === HERO SECTION (Full Screen) === */}
        <section className="min-h-screen flex flex-col justify-between p-6 md:p-12 pointer-events-none">
          {/* Header Stats */}
          <header className="flex justify-between items-start pointer-events-auto">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-widest mb-2 flex items-center gap-3">
                <span className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]" />
                LIVING PLANET
              </h1>
              <div className="text-xs text-cyan-300/80 space-y-1 font-light tracking-wider">
                <p>SYSTEM: ONLINE</p>
                <p>TARGET: NITR0YUKKURI</p>
              </div>
            </div>

            {/* Live Data Badge */}
            <div className="text-right text-xs text-cyan-100/70 border border-cyan-900/50 bg-slate-950/40 backdrop-blur-md p-3 rounded-lg shadow-lg">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left">
                <span className="text-gray-500">LOC</span>
                <span>OSAKA, JP</span>
                <span className="text-gray-500">WTHR</span>
                <span className={data.weather === 'Rain' ? 'text-blue-400' : 'text-orange-400'}>
                  {data.weather.toUpperCase()}
                </span>
                <span className="text-gray-500">ACTV</span>
                <span className="text-green-400">{(data.activityLevel * 100).toFixed(0)}%</span>
              </div>
            </div>
          </header>

          {/* Hero Text */}
          <div className="pointer-events-auto mb-20 md:mb-32">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-cyan-400 to-blue-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              WAKATOPO
            </h2>
            <p className="text-lg md:text-2xl text-slate-300 max-w-2xl leading-relaxed border-l-2 border-cyan-500 pl-6 bg-gradient-to-r from-slate-900/50 to-transparent py-2">
              "Code breathes with the atmosphere."<br />
              <span className="text-base text-slate-400 mt-2 block">
                An immersive 3D portfolio fusing GitHub activities with real-world weather.
              </span>
            </p>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2 animate-bounce pointer-events-auto opacity-70">
            <span className="text-[10px] tracking-widest text-cyan-400">SCROLL TO EXPLORE</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-400 to-transparent"></div>
          </div>
        </section>

        {/* === CONTENT SECTIONS (Scrollable) === */}
        {/* 背景にグラデーションをかけ、下に行くほど3Dが暗くなり文字が読みやすくなるようにする */}
        <div className="bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950/95 backdrop-blur-[2px]">

          {/* PHILOSOPHY */}
          <section className="container mx-auto px-6 py-32 pointer-events-auto">
            <div className="max-w-4xl mx-auto">
              <span className="text-cyan-500 text-sm tracking-widest font-bold mb-4 block">01 / PHILOSOPHY</span>
              <h3 className="text-3xl md:text-5xl font-bold mb-12 leading-tight">
                Webサイトを<br />
                「静的な情報の羅列」から<br />
                <span className="text-cyan-400">「呼吸する惑星」</span>へ。
              </h3>
              <div className="grid md:grid-cols-2 gap-12 text-slate-300 leading-8 text-lg">
                <p>
                  このポートフォリオは、単なる作品集ではありません。
                  <b>GitHubの活動履歴（Commit）</b>が惑星の地形を隆起させ、
                  <b>現実世界の気象（Weather）</b>がその空間の空気を決定づけます。
                </p>
                <p>
                  クリエイティブコーディングと最新のWeb技術を駆使し、
                  エンジニアとしての「生存記録」を、有機的なデジタルアートとして昇華させる実験的プロジェクトです。
                </p>
              </div>
            </div>
          </section>

          {/* PROJECTS */}
          <section className="container mx-auto px-6 py-32 pointer-events-auto border-t border-slate-800/50">
            <div className="max-w-6xl mx-auto">
              <span className="text-cyan-500 text-sm tracking-widest font-bold mb-8 block">02 / SELECTED WORKS</span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Project 1 */}
                <div className="group relative bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all duration-500">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity text-6xl">🌍</div>
                  <div className="p-8 h-full flex flex-col">
                    <h4 className="text-2xl font-bold mb-2 text-cyan-100 group-hover:text-cyan-400 transition-colors">GitHub Planet</h4>
                    <div className="flex gap-2 mb-4 text-[10px] text-cyan-300/70 uppercase tracking-wider">
                      <span className="border border-cyan-900 px-2 py-1 rounded">Three.js</span>
                      <span className="border border-cyan-900 px-2 py-1 rounded">GraphQL</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                      開発者の活動量に応じて地形が変化する3D惑星生成アプリケーション。
                      日々のコードコミットが惑星の「質量」となり、エンジニアとしてのアイデンティティを可視化します。
                    </p>
                  </div>
                </div>

                {/* Project 2 */}
                <div className="group relative bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all duration-500">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity text-6xl">🌦️</div>
                  <div className="p-8 h-full flex flex-col">
                    <h4 className="text-2xl font-bold mb-2 text-cyan-100 group-hover:text-cyan-400 transition-colors">Otenki Gurashi</h4>
                    <div className="flex gap-2 mb-4 text-[10px] text-cyan-300/70 uppercase tracking-wider">
                      <span className="border border-cyan-900 px-2 py-1 rounded">Next.js</span>
                      <span className="border border-cyan-900 px-2 py-1 rounded">PWA</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                      現実の天気と完全にリンクする生活シミュレーション。
                      雨の日にはアンニュイに、晴れの日には活発に。デジタル上のキャラクターが「同じ空の下」で暮らします。
                    </p>
                  </div>
                </div>

                {/* Project 3 */}
                <div className="group relative bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all duration-500">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity text-6xl">🧊</div>
                  <div className="p-8 h-full flex flex-col">
                    <h4 className="text-2xl font-bold mb-2 text-cyan-100 group-hover:text-cyan-400 transition-colors">ColdKeep</h4>
                    <div className="flex gap-2 mb-4 text-[10px] text-cyan-300/70 uppercase tracking-wider">
                      <span className="border border-cyan-900 px-2 py-1 rounded">AI Analysis</span>
                      <span className="border border-cyan-900 px-2 py-1 rounded">Audio</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                      水筒を振った「音」だけで氷の残量を推定するAIプロダクト。
                      非接触センシング技術とDeep Learningを用いた、日常に溶け込むIoTソリューション。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SKILLS */}
          <section className="container mx-auto px-6 py-32 pointer-events-auto border-t border-slate-800/50">
            <div className="max-w-4xl mx-auto text-center">
              <span className="text-cyan-500 text-sm tracking-widest font-bold mb-8 block">03 / TECHNOLOGY STACK</span>
              <div className="flex flex-wrap justify-center gap-3">
                {['TypeScript', 'React', 'Next.js 15', 'Three.js (R3F)', 'GLSL Shaders', 'Supabase', 'Tailwind CSS', 'Node.js', 'Python', 'Git', 'Vercel'].map((tech) => (
                  <span key={tech} className="px-6 py-3 bg-slate-900 rounded-full text-cyan-100 border border-slate-800 text-sm hover:border-cyan-500/50 hover:bg-cyan-900/20 hover:text-cyan-400 transition-all cursor-default">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-slate-800 bg-black/80 py-16 pointer-events-auto">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-8 tracking-tighter">LET'S CONNECT</h2>
              <div className="flex justify-center gap-8 mb-12">
                <a href="https://github.com/nitr0yukkuri" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-widest text-sm">GitHub</a>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-widest text-sm">Twitter</a>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-widest text-sm">Mail</a>
              </div>
              <p className="text-xs text-slate-600">
                © 2026 WAKATO NAKATA. ALL RIGHTS RESERVED.<br />
                DESIGNED & DEVELOPED WITH ❤️ IN OSAKA.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}