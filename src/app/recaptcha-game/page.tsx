'use client'

import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export default function RecaptchaGamePage() {
    const router = useRouter();
    const { setActiveWork } = useStore();

    const handleReturn = () => {
        setActiveWork(null);
        router.push('/');
    };

    return (
        <main className="relative min-h-[100dvh] bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.08),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_35%),#04070d] text-white overflow-x-hidden">
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-12 mix-blend-exclusion">
                <button onClick={handleReturn} className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-[#f8fafc] hover:text-cyan-300 transition-colors group">
                    <span className="w-6 h-[1px] bg-[#f8fafc] group-hover:bg-cyan-300 transition-colors" />
                    RETURN TO ORBIT
                </button>
            </nav>

            <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-36 pb-24">
                <div className="text-center mb-20">
                    <span className="inline-block border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest mb-8">
                        REACT / GO / WEBSOCKET
                    </span>
                    <img
                        src="/recatcha-logo.png"
                        alt="recaptchaゲーム ロゴ"
                        className="w-full max-w-sm md:max-w-md mx-auto"
                    />
                    <p className="mt-6 text-lg md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                        おなじみの画像認証をモチーフにした、新感覚のリアルタイム対戦ゲーム。
                        <br className="hidden md:block" />
                        素早く正確に画像を選び、相手より先に勝利条件へ到達することを目指します。
                    </p>
                </div>

                <div className="space-y-10">
                    <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <h2 className="text-xs font-mono tracking-widest text-cyan-300 mb-6 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-cyan-400" />
                            01 / OVERVIEW
                        </h2>
                        <p className="text-gray-200 leading-relaxed text-base md:text-lg">
                            出題されるお題に当てはまる画像を 9 枚のパネルから見つけ出し、確認ボタンで判定する対戦型ゲームです。
                            一人で遊べる CPU 戦と、WebSocket を利用したオンライン対戦の両方に対応しており、短時間で緊張感のあるプレイ体験を目指しました。
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <h2 className="text-xs font-mono tracking-widest text-cyan-300 mb-8 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-cyan-400" />
                            02 / FEATURES
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">RIVAL VIEW</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    WebSocket による低遅延同期で、相手が今どの画像を選択しているかをリアルタイム表示。対戦の焦りと読み合いを可視化します。
                                </p>
                            </div>
                            <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">COMBO & JAMMING</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    連続正解でコンボを繋ぐと、SHAKE、SPIN、SKEW、BLUR、INVERT、GRAYSCALE、ONION_RAIN などの妨害演出を相手に発動できます。
                                </p>
                            </div>
                            <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">SMOOTH UI / SOUND</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Framer Motion による滑らかな UI 遷移と Tone.js のサウンド演出を組み合わせ、気持ちよく遊べる操作感を作りました。
                                </p>
                            </div>
                            <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">LIGHTWEIGHT STATE</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    状態管理は Redux ではなく Zustand を採用。軽量で見通しの良い構成を維持しながら、対戦状態の更新にも素早く追従します。
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <h2 className="text-xs font-mono tracking-widest text-cyan-300 mb-8 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-cyan-400" />
                            03 / TECH STACK
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-cyan-300 font-bold mb-4">FRONTEND</h3>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">React 18</span>
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">TypeScript</span>
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Vite</span>
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Zustand</span>
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Tailwind CSS</span>
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Framer Motion</span>
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">react-use-websocket</span>
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Tone.js</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-cyan-300 font-bold mb-4">BACKEND</h3>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Go</span>
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">WebSocket</span>
                                    <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">net/http</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <h2 className="text-xs font-mono tracking-widest text-cyan-300 mb-8 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-cyan-400" />
                            04 / HOW TO PLAY
                        </h2>
                        <ol className="space-y-4 text-gray-300 leading-relaxed list-decimal list-inside">
                            <li>ゲームモードを選択します。</li>
                            <li>お題を確認し、9 枚の画像から条件に合うものを選択します。</li>
                            <li>確認ボタンを押して判定し、正解するとスコアが加算されます。</li>
                            <li>コンボを繋ぐと相手に妨害エフェクトを送れます。</li>
                            <li>先に Winning Score に到達したプレイヤーの勝利です。</li>
                        </ol>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <h2 className="text-xs font-mono tracking-widest text-cyan-300 mb-8 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-cyan-400" />
                            05 / LOCAL SETUP
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">BACKEND</h3>
                                <pre className="text-xs text-cyan-100 font-mono whitespace-pre-wrap">cd backend
                                    go mod download
                                    go run main.go</pre>
                            </div>
                            <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">FRONTEND</h3>
                                <pre className="text-xs text-cyan-100 font-mono whitespace-pre-wrap">cd frontend
                                    npm install
                                    npm run dev</pre>
                            </div>
                        </div>
                    </section>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://recaptchgame-web.onrender.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 rounded-full border border-cyan-400/50 text-cyan-300 font-mono text-sm bg-cyan-400/10 hover:bg-cyan-400/20 transition-colors"
                        >
                            OPEN APP
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}