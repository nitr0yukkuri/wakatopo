'use client'

import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export default function DenshouoPage() {
    const router = useRouter();
    const { setActiveWork } = useStore();

    const handleReturn = () => {
        setActiveWork(null);
        router.push('/');
    };

    return (
        <main className="relative min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_28%),radial-gradient(circle_at_bottom,rgba(20,184,166,0.12),transparent_35%),#041116] text-white overflow-x-hidden">
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-12 mix-blend-exclusion">
                <button onClick={handleReturn} className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-[#ecfeff] hover:text-teal-200 transition-colors group">
                    <span className="w-6 h-px bg-[#ecfeff] group-hover:bg-teal-200 transition-colors" />
                    RETURN TO ORBIT
                </button>
            </nav>

            <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-36 pb-24">
                <div className="text-center mb-20">
                    <span className="inline-block border border-teal-300/30 bg-teal-300/10 text-teal-200 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest mb-8">
                        REACT / SUPABASE
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">でんしょうお</h1>
                    <p className="mt-6 text-lg md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                        つぶやくほどでもない小さな幸せを魚に乗せて流し、みんなでゆるく分かち合う SNS。
                    </p>
                    <p className="mt-4 text-sm md:text-base text-teal-200/80 font-mono">
                        2025.10.07 公開 / 2025.10.11 更新 / 技育CAMP Vol.10 優秀賞
                    </p>
                </div>

                <div className="space-y-10">
                    <section className="bg-white/5 border border-white/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-6 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            01 / OVERVIEW
                        </h2>
                        <p className="text-gray-200 leading-relaxed text-base md:text-lg">
                            小さな幸せをおさかなに乗せて流し、時間が経つとどこかへ泳いでいく、気軽さ重視の投稿体験を目指したアプリです。
                            「気兼ねなく流せること」と「ちょっとした幸せを誰かと分かち合えること」を中心に設計しました。
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            02 / CONCEPT
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">SMALL HAPPINESS</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    大げさな発信ではなく、日常の小さな幸せを軽く流せることを重視。時間経過で投稿が流れていくため、心理的ハードルを下げています。
                                </p>
                            </div>
                            <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">LIGHT AND SHADOW</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    幸せだけでなく、少しダークな感情も含めて海に流せる世界観を持たせ、単なるメモアプリではない情緒を加えました。
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            03 / TECHNICAL NOTES
                        </h2>
                        <div className="space-y-6">
                            <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">FRONTEND</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    React、TypeScript、Vite、Tailwind CSS を中心に構築。魚ごとのコンポーネント管理を行い、時間が足りない場面では CSS アニメーションも併用して完成度を優先しました。
                                </p>
                            </div>
                            <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">BACKEND / DB</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    ハッカソン開発での学習コストと速度を考慮し、バックエンドとデータベースを兼ねられる Supabase を採用。定期実行ジョブを使い、時間差でデータが消える仕様も実現しました。
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">React</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">TypeScript</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Vite</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Tailwind CSS</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Supabase</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Vercel</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            04 / DEVELOPMENT CONTEXT
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                            2025 年の技育CAMP Vol.10 にて開発。チームメンバーは全員 1 回生で、使う技術の多くが初挑戦という状態からスタートしました。
                            その中で、学習コストと実装速度のバランスを取りながら形にし、優秀賞を受賞したプロジェクトです。
                        </p>
                    </section>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://oikomi-front.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 rounded-full border border-teal-300/50 text-teal-200 font-mono text-sm bg-teal-300/10 hover:bg-teal-300/20 transition-colors"
                        >
                            OPEN APP
                        </a>
                        <a
                            href="https://x.com/geek_pjt/status/1954474531743232383?t=03zVZf-zya95vP3PMc1VOQ&s=19"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 rounded-full border border-white/15 text-gray-300 font-mono text-sm bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            RELATED LINK
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}