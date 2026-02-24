'use client'

import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export default function GitHubPlanetPage() {
    const router = useRouter();
    const { setActiveWork } = useStore();

    const handleReturn = () => {
        setActiveWork(null); // ワープ状態をリセット
        router.push('/');
    };

    return (
        <main className="relative w-full min-h-screen bg-[#020202] text-white flex items-center justify-center overflow-hidden">
            {/* 簡易的な星屑背景（CSSアニメーション） */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute w-2 h-2 bg-white rounded-full top-[20%] left-[30%] animate-pulse" />
                <div className="absolute w-1 h-1 bg-white rounded-full top-[50%] left-[80%] animate-pulse delay-75" />
                <div className="absolute w-3 h-3 bg-cyan-400 rounded-full top-[80%] left-[40%] animate-pulse delay-150 blur-[2px]" />
                <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[70%] animate-pulse delay-300" />
            </div>

            <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center animate-fade-in-up">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] mb-8">
                    GITHUB PLANET
                </h1>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <p className="text-xl md:text-2xl font-light text-gray-200 mb-8 leading-relaxed">
                        あなたのコードが、星になる。<br />
                        GitHubの活動履歴からあなただけの惑星を生成するデジタル空間。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-10">
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-cyan-400 font-mono text-sm mb-3">01 // TERRAIN</h3>
                            <p className="text-gray-400 text-sm">使用言語とコントリビューション数で惑星の色と輝きが変化します。</p>
                        </div>
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-cyan-400 font-mono text-sm mb-3">02 // ROTATION</h3>
                            <p className="text-gray-400 text-sm">コミットが活発なほど、惑星の自転速度が上昇します。</p>
                        </div>
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-cyan-400 font-mono text-sm mb-3">03 // AURA</h3>
                            <p className="text-gray-400 text-sm">活動量に応じて、周囲を回る光のオーラが成長します。</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <a
                            href="https://github.com/nitr0yukkuri/githubplanet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 px-8 py-4 rounded-full font-mono text-sm hover:bg-cyan-500/20 hover:scale-105 transition-all duration-300 flex items-center gap-3"
                        >
                            <span>EXPLORE REPOSITORY</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>

                        <button
                            onClick={handleReturn}
                            className="text-gray-500 font-mono text-sm hover:text-white transition-colors underline underline-offset-4"
                        >
                            Return to Orbit
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
