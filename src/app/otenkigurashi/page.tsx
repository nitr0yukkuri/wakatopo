'use client'

import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import Scene from '@/components/canvas/Scene';

export default function OtenkiGurashiPage() {
    const router = useRouter();
    const { setActiveWork } = useStore();

    const handleReturn = () => {
        setActiveWork(null); // ワープ状態をリセット
        router.push('/');
    };

    return (
        <main className="relative w-full min-h-[120vh] bg-[#020202] text-white overflow-x-hidden">
            {/* バックグラウンドにはWeatherを含むSceneを使用 */}
            <div className="fixed inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                <Scene />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32 pb-32 flex flex-col items-center animate-fade-in-up pointer-events-none">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] mb-8">
                    OTENKI GURASHI
                </h1>

                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-8 md:p-14 rounded-[2.5rem] w-full shadow-[0_0_80px_rgba(0,0,0,0.8)] pointer-events-auto">
                    <p className="text-xl md:text-2xl font-light text-gray-200 mb-12 leading-relaxed text-center">
                        天気予報を見ないあなたの、<br className="md:hidden" />いちばん優しいおまもり。<br />
                        <span className="text-orange-400 font-medium">おてんきぐらし</span> は、現実の天気と連動する心地よいシミュレーション体験です。
                    </p>

                    <div className="space-y-16">
                        {/* THE CONCEPT */}
                        <div>
                            <h2 className="text-2xl font-bold tracking-widest text-white mb-6 border-b border-white/10 pb-4">01 // THE CONCEPT</h2>
                            <p className="text-gray-400 leading-relaxed max-w-3xl">
                                天気予報の確認は面倒だけど、急な雨や気圧の変化はつらい… そんな方々のために生まれました。
                                ゲーム性のある優しい世界を通して、面倒だった天気確認を「雨だから、ゲーム内で特別なことができるかも？」という、ポジティブな体験へと変えていきます。
                            </p>
                        </div>

                        {/* FEATURES */}
                        <div>
                            <h2 className="text-2xl font-bold tracking-widest text-white mb-6 border-b border-white/10 pb-4">02 // FEATURES</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-colors">
                                    <h3 className="text-orange-400 font-mono text-base mb-3 font-bold">REALTIME WEATHER SYNC</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        あなたのいる場所の「今」が、キャラクターの世界に直接反映されます。大阪で雨が降ればゲームの中も雨が降り、夜になればキャラクターも眠りにつきます。
                                    </p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-colors">
                                    <h3 className="text-orange-400 font-mono text-base mb-3 font-bold">OSANPO (WALKING)</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        キャラクターを「おさんぽ」に出すことができます。おさんぽ先の景色や、手に入るアイテムは天気によって変化。コレクションする楽しみが待っています。
                                    </p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-colors md:col-span-2">
                                    <h3 className="text-orange-400 font-mono text-base mb-3 font-bold">COLLECTION & ACHIEVEMENTS</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        レベルアップのようなノルマはありません。「おさんぽ」で集めたアイテムを眺める「ずかん」や、「はじめて雨の日におさんぽした」といったキャラクターとの思い出を記録する「実績」が、あなたの毎日を彩ります。
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* TECHNICAL STACK */}
                        <div>
                            <h2 className="text-2xl font-bold tracking-widest text-white mb-6 border-b border-white/10 pb-4">03 // TECHNICAL STACK</h2>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Next.js</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">TypeScript</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Tailwind CSS</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">OpenWeatherMap API</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">PWA</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <a
                            href="https://weather-live-ochre.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-orange-500/10 border border-orange-500/50 text-orange-400 px-8 py-4 rounded-full font-mono text-sm hover:bg-orange-500/20 hover:scale-105 transition-all duration-300 flex items-center gap-3"
                        >
                            <span>LAUNCH APP</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>

                        <a
                            href="https://github.com/nitr0yukkuri/otenkigurashi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-800/50 border border-gray-600 text-gray-300 px-8 py-4 rounded-full font-mono text-sm hover:bg-gray-700 transition-all duration-300 flex items-center gap-3"
                        >
                            <span>VIEW ON GITHUB</span>
                        </a>

                        <button
                            onClick={handleReturn}
                            className="text-gray-500 font-mono text-sm hover:text-white transition-colors underline underline-offset-4 ml-0 sm:ml-4 mt-4 sm:mt-0"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
