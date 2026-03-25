import Link from 'next/link';
import GeoLocationBadge from '@/components/dom/GeoLocationBadge';

export default function AboutPage() {
    return (
        <main className="relative min-h-dvh bg-[#050505] text-white overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-20" />

            <nav className="relative z-50 p-6 md:p-12">
                <Link href="/" className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-cyan-500 hover:text-white transition-colors group">
                    <span className="w-6 h-[1px] bg-cyan-500 group-hover:bg-white transition-colors" />
                    RETURN TO ORBIT
                </Link>
            </nav>

            <section className="relative z-10 container mx-auto px-6 md:px-12 pb-10 md:pb-14 max-w-6xl">
                <div className="rounded-3xl border border-cyan-500/20 bg-black/35 backdrop-blur-md p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <img
                                src="/faviconwakato.png"
                                alt="WAKATO icon"
                                className="h-16 w-16 rounded-2xl border border-cyan-400/30 bg-black/40 object-cover"
                            />
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">WAKATO</h1>
                                <p className="mt-1 text-cyan-300 text-sm md:text-base font-mono">Interactive Web Developer / Creative Coder</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[10px] font-mono tracking-[0.2em]">
                            <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-cyan-300">CLASS OF 2029</span>
                            <GeoLocationBadge />
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">INTERNSHIP WELCOME</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-start gap-4 text-sm font-mono">
                        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <h2 className="text-cyan-300 text-xs tracking-widest mb-3">経歴</h2>
                            <p className="text-gray-300 leading-relaxed">ECCコンピュータ専門学校 在学（29卒）。フロントエンドを軸に3D/インタラクション実装を継続中。UIの体験設計と見た目の作り込みを得意にしつつ、志望はバックエンド寄りで、API設計やデータ設計まで責任を持てる開発者を目指しています。</p>
                        </article>

                        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <h2 className="text-cyan-300 text-xs tracking-widest mb-3">実績</h2>
                            <ul className="text-gray-300 space-y-2 leading-relaxed text-xs">
                                <li>技育CAMP Vol.10 優秀賞 でんしょうお</li>
                                <li>技育CAMP Vol.12 努力賞 きじょバト</li>
                                <li>うめきたTechBase 最優秀賞 グルメイカー</li>
                                <li>技育CAMP Vol.14 優秀賞 GitHub Planet</li>
                                <li>技育博 Vol.5 展示 おてんきぐらし | グルメイカー</li>
                                <li>ヒーローズ・リーグ 決勝進出 GitHub Planet</li>
                                <li className="pt-1 text-cyan-200">2026</li>
                                <li>技育博 Vol.6 企業賞(ウイングアーク1st) GitHub Planet</li>
                                <li>技育CAMP Vol.19 最優秀賞 recaptchaゲーム</li>
                                <li>機械学習基盤体験型2daysサイバーエージェントインターンシップ 参加</li>
                            </ul>
                        </article>

                        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <h2 className="text-cyan-300 text-xs tracking-widest mb-3">開発体制</h2>
                            <p className="text-gray-300 leading-relaxed">個人で要件整理・UI設計・実装・デプロイまで一貫対応。必要に応じてAPI/DB連携まで対応可能。</p>
                        </article>

                        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <h2 className="text-cyan-300 text-xs tracking-widest mb-3">稼働可能時期</h2>
                            <p className="text-gray-300 leading-relaxed">インターン・業務委託ともに相談可。短期PoC/プロトタイプ案件は優先して調整可能。</p>
                        </article>

                        <article className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2 xl:col-span-2">
                            <h2 className="text-cyan-300 text-xs tracking-widest mb-3">得意領域</h2>
                            <div className="flex flex-wrap gap-2 text-[11px]">
                                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">Next.js / React</span>
                                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">TypeScript</span>
                                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">Three.js / R3F</span>
                                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">Web Audio API</span>
                                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">Interactive UI Motion</span>
                            </div>
                        </article>
                    </div>

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
            </section>
        </main>
    );
}
