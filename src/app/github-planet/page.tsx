'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

// Lazy load the heavy 3D scene to reduce TBT
const RealisticPlanetScene = dynamicImport(() => import('@/components/canvas/RealisticPlanetScene'), { ssr: false });

export default function GitHubPlanetPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const { setActiveWork } = useStore();

    const t = {
        ja: {
            heroLead1: 'あなたのコードが、星になる。',
            heroLead2: 'は、コミット履歴からあなただけの惑星を生成するデジタル空間です。',
            conceptText: 'エンジニアの日々の営みである「コードを書く」という行為。それは時に孤独で無機質な作業に感じられるかもしれません。GitHub Planet は、そんな見えない努力を可視化し、宇宙空間に浮かぶ美しく有機的な「惑星」として表現するWebアプリケーションです。あなたの活動が、静かだった宇宙に新たな星を誕生させます。',
            terrainText: 'GitHubのAPIを通じてあなたのメイン言語を解析し、惑星の地表構造（テクスチャ）とベースカラーを決定します。コントリビューション数が増えるにつれて、惑星はより鮮やかに、生命力に満ちた輝きを放つようになります。',
            rotationText: '惑星は生きています。直近のコミット活動が活発なほど、惑星の自転速度が上昇し、よりダイナミックな動きを見せます。逆に少し開発を休んでいる時は、静かにゆっくりと自転し、休息の時間を表現します。',
            auraText: '星の周囲には、カスタムシェーダーによって描画される美しい光のオーラが漂っています。これまでの星（Star）の獲得数や実績に応じて、惑星の周りには小さな光の粒（Starfield）が集まり、重力に引かれるように公転し始めます。',
            meteorsText: 'Socket.IOを利用したリアルタイム通信により、同じ瞬間に世界のどこかで誰かがコミットしたとき、あなたの空に一筋の流星（Meteor）が駆け抜けます。スケールや透明度がAnime.jsによって滑らかに制御され、他のエンジニアとの緩やかな繋がりを感じさせます。',
            returnToOrbit: 'Return to Orbit',
        },
        en: {
            heroLead1: 'Your code becomes a planet.',
            heroLead2: 'is a digital space that generates your own planet from your commit history.',
            conceptText: 'Writing code is a daily practice for engineers, but it can sometimes feel solitary and mechanical. GitHub Planet visualizes those invisible efforts as a beautiful organic planet floating in space. Your activity gives birth to a new star in what was once a quiet universe.',
            terrainText: 'Through the GitHub API, your primary language is analyzed to determine planetary surface texture and base color. As your contribution count grows, the planet becomes more vivid and shines with stronger vitality.',
            rotationText: 'The planet is alive. The more active your recent commits are, the faster it rotates and the more dynamic it feels. During quieter periods, rotation slows down to express a phase of rest.',
            auraText: 'A luminous aura rendered with custom shaders surrounds the planet. Based on your accumulated stars and achievements, tiny light particles gather around it and begin orbiting like a starfield pulled by gravity.',
            meteorsText: 'With real-time communication via Socket.IO, whenever someone in the world commits at the same moment, a meteor streaks across your sky. Scale and opacity are smoothly controlled with Anime.js to evoke a gentle connection with other engineers.',
            returnToOrbit: 'Return to Orbit',
        },
    } as const;
    const copy = t[lang];

    const handleReturn = () => {
        setActiveWork(null); // ワープ状態をリセット
        router.push(`/?lang=${lang}`);
    };

    return (
        <main className="relative w-full min-h-[120dvh] bg-[#020202] text-white overflow-x-hidden">
            {/* 3Dのリアルな惑星背景（GitHub Planetからの移植・調整版） */}
            <RealisticPlanetScene />

            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-12">
                <button
                    onClick={handleReturn}
                    className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-cyan-300 hover:text-white transition-colors group"
                >
                    <span className="w-6 h-px bg-cyan-300 group-hover:bg-white transition-colors" />
                    {copy.returnToOrbit}
                </button>
            </nav>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32 pb-16 flex flex-col items-center animate-fade-in-up pointer-events-none">
                {/* GitHub Planet Logo */}
                <img
                    src="/github-planet-logo.webp"
                    alt="GitHub Planet"
                    width={640}
                    height={221}
                    fetchPriority="high"
                    decoding="async"
                    className="w-full max-w-xs md:max-w-md mx-auto mb-4 drop-shadow-[0_0_30px_rgba(120,120,255,0.4)]"
                    style={{ mixBlendMode: 'screen' }}
                />

                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-8 md:p-14 rounded-[2.5rem] w-full shadow-[0_0_80px_rgba(0,0,0,0.8)] pointer-events-auto">
                    <p className="text-xl md:text-3xl font-light text-gray-200 mb-12 leading-relaxed text-center">
                        {copy.heroLead1}<br />
                        <span className="text-cyan-400 font-medium">GitHub Planet</span> {copy.heroLead2}
                    </p>

                    <div className="space-y-16">
                        {/* THE CARD */}
                        <div className="w-full relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl"></div>
                            <div className="relative z-10 w-full aspect-[2/1] rounded-2xl border border-white/10 shadow-2xl overflow-hidden hover:border-cyan-500/50 transition-colors duration-500 bg-[#060b16]">
                                <iframe
                                    src="https://githubplanet.onrender.com/card.html?username=nitr0yukkuri&fix=true"
                                    title="GitHub Planet Card - nitr0yukkuri"
                                    loading="lazy"
                                    className="w-full h-full"
                                />
                            </div>
                            <p className="text-center text-xs text-gray-500 font-mono mt-4">
                                Generated Planet Card for @nitr0yukkuri
                            </p>
                        </div>

                        {/* THE CONCEPT */}
                        <div>
                            <h2 className="text-2xl font-bold tracking-widest text-white mb-6 border-b border-white/10 pb-4">01 // THE CONCEPT</h2>
                            <p className="text-gray-400 leading-relaxed max-w-3xl">
                                {copy.conceptText}
                            </p>
                        </div>

                        {/* HOW IT WORKS */}
                        <div>
                            <h2 className="text-2xl font-bold tracking-widest text-white mb-6 border-b border-white/10 pb-4">02 // HOW IT WORKS</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                                    <h3 className="text-cyan-400 font-mono text-base mb-3 font-bold">TERRAIN & COLOR</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {copy.terrainText}
                                    </p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                                    <h3 className="text-cyan-400 font-mono text-base mb-3 font-bold">LIVING ROTATION</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {copy.rotationText}
                                    </p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                                    <h3 className="text-cyan-400 font-mono text-base mb-3 font-bold">AURA & STARS</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {copy.auraText}
                                    </p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                                    <h3 className="text-cyan-400 font-mono text-base mb-3 font-bold">METEORS</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {copy.meteorsText}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* TECHNICAL STACK */}
                        <div>
                            <h2 className="text-2xl font-bold tracking-widest text-white mb-6 border-b border-white/10 pb-4">03 // TECHNICAL STACK</h2>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Three.js</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">WebGL / GLSL</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Socket.IO</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Node.js</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Anime.js</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">GitHub GraphQL API</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://github.com/nitr0yukkuri/githubplanet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 px-8 py-4 rounded-full font-mono text-sm hover:bg-cyan-500/20 hover:scale-105 transition-all duration-300 flex items-center gap-3"
                        >
                            <span>EXPLORE REPOSITORY</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>

                        <a
                            href="https://githubplanet.onrender.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/5 border border-white/20 text-gray-200 px-8 py-4 rounded-full font-mono text-sm hover:bg-white/10 hover:text-white transition-all duration-300 flex items-center gap-3"
                        >
                            <span>OPEN LIVE SITE</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
