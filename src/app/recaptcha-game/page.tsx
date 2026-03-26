'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store';

export const dynamic = 'force-dynamic';

export default function RecaptchaGamePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const { setActiveWork } = useStore();

    const t = {
        ja: {
            returnToOrbit: 'RETURN TO ORBIT',
            lead: 'おなじみの画像認証をモチーフにした、新感覚のリアルタイム対戦ゲーム。相手の操作を読みながら、誰より速く、誰より正確にパネルを制圧する。',
            mission: '出題されるお題に合う画像を 9 枚のパネルから選び、確認ボタンで判定する対戦型ゲーム。CPU 戦と WebSocket によるオンライン対戦に対応し、短時間で高密度な読み合いを体験できます。',
            feature1: 'RIVAL VIEW: 相手の選択状況を低遅延で可視化',
            feature2: 'COMBO & JAMMING: 連続正解で妨害演出を発動',
            feature3: 'SMOOTH UI / SOUND: Framer Motion と Tone.js の同期',
            feature4: 'LIGHTWEIGHT STATE: Zustand による高速状態更新',
            how1: 'ゲームモードを選択します。',
            how2: 'お題を確認し、9 枚の画像から条件に合うものを選択します。',
            how3: '確認ボタンを押して判定し、正解でスコア加算。',
            how4: 'コンボを繋ぐと相手に妨害エフェクトを送信。',
            how5: '先に Winning Score へ到達したプレイヤーが勝利。',
        },
        en: {
            returnToOrbit: 'RETURN TO ORBIT',
            lead: 'A fresh real-time competitive game inspired by familiar image verification. Read your opponent, capture panels faster, and win with precision.',
            mission: 'A head-to-head game where you select matching images from 9 panels and verify with the confirm button. Supports both CPU matches and online multiplayer via WebSocket for dense mind games in short sessions.',
            feature1: 'RIVAL VIEW: Visualize opponent choices with low latency',
            feature2: 'COMBO & JAMMING: Trigger interference effects with streaks',
            feature3: 'SMOOTH UI / SOUND: Synchronized Framer Motion and Tone.js',
            feature4: 'LIGHTWEIGHT STATE: Fast state updates powered by Zustand',
            how1: 'Select a game mode.',
            how2: 'Check the prompt and choose matching images from 9 panels.',
            how3: 'Press confirm to validate and gain score on correct answers.',
            how4: 'Build combos to send jamming effects to your opponent.',
            how5: 'The first player to reach Winning Score wins.',
        },
    } as const;
    const copy = t[lang];

    const handleReturn = () => {
        setActiveWork(null);
        router.push(`/?lang=${lang}`);
    };

    return (
        <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#02050c] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(59,130,246,0.2),transparent_33%),radial-gradient(circle_at_82%_12%,rgba(56,189,248,0.15),transparent_30%),radial-gradient(circle_at_50%_85%,rgba(14,165,233,0.2),transparent_40%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-30 [background:linear-gradient(rgba(125,211,252,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute -top-44 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full border border-cyan-300/20" />
            <div className="pointer-events-none absolute -top-28 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full border border-sky-300/15" />

            <div className="pointer-events-none absolute top-[18%] left-[8%] hidden h-36 w-56 rounded-xl border border-cyan-200/20 bg-[#031123]/45 md:block" />
            <div className="pointer-events-none absolute top-[24%] left-[10%] hidden h-[1px] w-40 bg-cyan-300/40 md:block" />
            <div className="pointer-events-none absolute top-[22%] right-[8%] hidden h-44 w-64 rounded-xl border border-sky-200/20 bg-[#030d1c]/45 md:block" />
            <div className="pointer-events-none absolute bottom-[14%] right-[10%] hidden h-28 w-48 rounded-xl border border-blue-200/20 bg-[#020a17]/50 md:block" />

            <nav className="fixed top-0 left-0 w-full z-50 px-5 py-5 md:px-10 md:py-8 border-b border-cyan-400/20 bg-[#030711]/60 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
                    <button
                        onClick={handleReturn}
                        className="inline-flex items-center gap-3 text-xs md:text-sm font-mono tracking-[0.22em] text-cyan-100/90 hover:text-cyan-300 transition-colors group"
                    >
                        <span className="w-6 h-[1px] bg-cyan-100/90 group-hover:bg-cyan-300 transition-colors" />
                        {copy.returnToOrbit}
                    </button>
                    <div className="hidden md:flex items-center gap-4 text-[10px] font-mono tracking-[0.24em] text-cyan-200/70">
                        <span>MODE / MULTIPLAYER</span>
                        <span className="inline-flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
                            LIVE
                        </span>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 mx-auto max-w-6xl px-5 pt-28 pb-20 md:px-10 md:pt-36 md:pb-24">
                <section className="relative overflow-hidden rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-[#071427]/95 via-[#091831]/92 to-[#071225]/95 p-6 shadow-[0_24px_80px_rgba(4,13,26,0.7)] md:p-10">
                    <div className="pointer-events-none absolute inset-0 opacity-30 [background:linear-gradient(135deg,transparent_0%,transparent_48%,rgba(34,211,238,0.16)_50%,transparent_52%,transparent_100%)]" />
                    <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:gap-10">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-1.5 text-[10px] font-mono tracking-[0.22em] text-cyan-200">
                                REACT / GO / WEBSOCKET
                            </span>
                            <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-tight text-cyan-50 md:text-6xl">
                                RECAPTCHA GAME
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-cyan-100/80 md:text-base">
                                {copy.lead}
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-mono tracking-[0.2em] text-white/80">PVP / CPU</span>
                                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-mono tracking-[0.2em] text-white/80">COMBO SYSTEM</span>
                                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-mono tracking-[0.2em] text-white/80">JAMMING FX</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-300/25 bg-[#030917]/75 p-5 backdrop-blur-xl">
                            <p className="text-[10px] font-mono tracking-[0.22em] text-cyan-300/80">COMBAT HUD</p>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <div className="mb-1 flex justify-between text-[10px] font-mono tracking-[0.2em] text-cyan-100/75">
                                        <span>PLAYER ACCURACY</span>
                                        <span>93%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-cyan-950/70">
                                        <div className="h-full w-[93%] bg-cyan-300" />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 flex justify-between text-[10px] font-mono tracking-[0.2em] text-cyan-100/75">
                                        <span>RIVAL PRESSURE</span>
                                        <span>78%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-cyan-950/70">
                                        <div className="h-full w-[78%] bg-sky-400" />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 flex justify-between text-[10px] font-mono tracking-[0.2em] text-cyan-100/75">
                                        <span>JAM CHARGE</span>
                                        <span>MAX</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-cyan-950/70">
                                        <div className="h-full w-full bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-10 grid gap-5 md:grid-cols-2">
                    <article className="rounded-2xl border border-white/10 bg-[#050b16]/85 p-6 backdrop-blur-xl">
                        <h2 className="text-xs font-mono tracking-[0.2em] text-cyan-300">01 / MISSION</h2>
                        <p className="mt-4 text-sm leading-relaxed text-gray-200 md:text-base">
                            {copy.mission}
                        </p>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-[#050b16]/85 p-6 backdrop-blur-xl">
                        <h2 className="text-xs font-mono tracking-[0.2em] text-cyan-300">02 / CORE FEATURES</h2>
                        <ul className="mt-4 space-y-3 text-sm text-gray-300">
                            <li>{copy.feature1}</li>
                            <li>{copy.feature2}</li>
                            <li>{copy.feature3}</li>
                            <li>{copy.feature4}</li>
                        </ul>
                    </article>
                </section>

                <section className="mt-5 rounded-2xl border border-white/10 bg-[#050b16]/85 p-6 backdrop-blur-xl md:p-8">
                    <h2 className="text-xs font-mono tracking-[0.2em] text-cyan-300">03 / HOW TO PLAY</h2>
                    <ol className="mt-4 grid gap-3 text-sm leading-relaxed text-gray-300 md:grid-cols-2">
                        <li>{copy.how1}</li>
                        <li>{copy.how2}</li>
                        <li>{copy.how3}</li>
                        <li>{copy.how4}</li>
                        <li>{copy.how5}</li>
                    </ol>
                </section>

                <section className="mt-5 rounded-2xl border border-white/10 bg-[#050b16]/85 p-6 backdrop-blur-xl md:p-8">
                    <h2 className="text-xs font-mono tracking-[0.2em] text-cyan-300">04 / TECH STACK</h2>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-bold text-cyan-200">FRONTEND</h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">React 18</span>
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">TypeScript</span>
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">Vite</span>
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">Zustand</span>
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">Tailwind CSS</span>
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">Framer Motion</span>
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">react-use-websocket</span>
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">Tone.js</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-cyan-200">BACKEND</h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">Go</span>
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">WebSocket</span>
                                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono text-gray-200">net/http</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-5 rounded-2xl border border-white/10 bg-[#050b16]/85 p-6 backdrop-blur-xl md:p-8">
                    <h2 className="text-xs font-mono tracking-[0.2em] text-cyan-300">05 / LOCAL SETUP</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                            <h3 className="text-sm font-bold text-cyan-100">BACKEND</h3>
                            <pre className="mt-3 whitespace-pre-wrap text-xs text-cyan-100/90 font-mono">cd backend
                                go mod download
                                go run main.go</pre>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                            <h3 className="text-sm font-bold text-cyan-100">FRONTEND</h3>
                            <pre className="mt-3 whitespace-pre-wrap text-xs text-cyan-100/90 font-mono">cd frontend
                                npm install
                                npm run dev</pre>
                        </div>
                    </div>
                </section>

                <div className="mt-8 flex items-center justify-center">
                    <a
                        href="https://recaptchgame-web.onrender.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-300/10 px-8 py-3 text-sm font-mono tracking-[0.2em] text-cyan-100 transition-colors hover:bg-cyan-300/20"
                    >
                        ENTER MATCH
                    </a>
                </div>
            </div>
        </main>
    );
}