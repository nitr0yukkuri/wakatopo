export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-[#010103] px-6 py-10 text-white">
            <style>{`
                @keyframes notfound-drift {
                    0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.12; }
                    50% { transform: translate3d(8px, -12px, 0) scale(1.08); opacity: 0.38; }
                    100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.16; }
                }

                @keyframes notfound-sheen {
                    0% { transform: translateX(-180%); opacity: 0; }
                    18% { opacity: 0.35; }
                    50% { opacity: 0.8; }
                    82% { opacity: 0.35; }
                    100% { transform: translateX(180%); opacity: 0; }
                }
            `}</style>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08)_0%,rgba(8,14,28,0.15)_18%,rgba(1,1,3,0.76)_46%,rgba(0,0,0,0.98)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,transparent_0%,rgba(1,1,3,0.12)_26%,rgba(1,1,3,0.48)_52%,rgba(0,0,0,0.88)_100%)]" />
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-size-[88px_88px]" />

            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <span className="absolute left-[8%] top-[14%] h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.75)]" style={{ animation: 'notfound-drift 7.5s ease-in-out infinite' }} />
                <span className="absolute left-[18%] top-[33%] h-1 w-1 rounded-full bg-white/80 shadow-[0_0_14px_rgba(255,255,255,0.45)]" style={{ animation: 'notfound-drift 11s ease-in-out infinite 0.8s' }} />
                <span className="absolute left-[28%] top-[20%] h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,0.6)]" style={{ animation: 'notfound-drift 9.2s ease-in-out infinite 1.2s' }} />
                <span className="absolute right-[12%] top-[16%] h-2 w-2 rounded-full bg-sky-100 shadow-[0_0_22px_rgba(125,211,252,0.68)]" style={{ animation: 'notfound-drift 8.4s ease-in-out infinite 0.4s' }} />
                <span className="absolute right-[20%] top-[30%] h-1 w-1 rounded-full bg-white/75 shadow-[0_0_14px_rgba(255,255,255,0.4)]" style={{ animation: 'notfound-drift 12.2s ease-in-out infinite 1.5s' }} />
                <span className="absolute right-[16%] bottom-[24%] h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(165,243,252,0.5)]" style={{ animation: 'notfound-drift 10.4s ease-in-out infinite 2s' }} />
                <span className="absolute left-[14%] bottom-[18%] h-1 w-1 rounded-full bg-white/60 shadow-[0_0_12px_rgba(255,255,255,0.32)]" style={{ animation: 'notfound-drift 13s ease-in-out infinite 1.8s' }} />
                <span className="absolute inset-x-[14%] top-[12%] h-px bg-linear-to-r from-transparent via-cyan-300/30 to-transparent opacity-50" />
                <span className="absolute inset-x-[8%] top-[56%] h-px bg-linear-to-r from-transparent via-white/10 to-transparent opacity-35" />
                <span className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10" />
                <span className="absolute left-1/2 top-1/2 h-152 w-152 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
                <section className="w-full max-w-4xl rounded-4xl border border-white/10 bg-white/3 px-6 py-10 shadow-[0_0_90px_rgba(0,0,0,0.52)] backdrop-blur-xl sm:px-10 sm:py-12">
                    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-cyan-100/55">
                            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500/70 animate-ping" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
                            </span>
                            <span>[ EDGE OF THE UNIVERSE ]</span>
                        </div>

                        <div className="relative mt-8 inline-block">
                            <div className="absolute inset-0 -z-10 scale-[1.08] rounded-full bg-cyan-300/10 blur-3xl" />
                            <h1 className="bg-linear-to-b from-neutral-900 via-neutral-100 to-neutral-900 bg-clip-text font-mono text-[clamp(5.5rem,18vw,12rem)] leading-none tracking-[0.2em] text-transparent drop-shadow-[0_0_24px_rgba(255,255,255,0.1)]">
                                404
                            </h1>
                        </div>

                        <p className="mt-6 max-w-2xl text-balance text-sm leading-7 text-slate-300/90 sm:text-base md:text-lg">
                            You have drifted beyond the charted sectors.
                            <span className="block text-slate-400/90">The cosmic background noise is louder here, and every signal arrives too late to matter.</span>
                        </p>

                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                            <a
                                href="/"
                                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 text-sm font-medium text-cyan-50 backdrop-blur-md transition-all duration-300 hover:border-cyan-200/60 hover:bg-cyan-200/15 hover:shadow-[0_0_30px_rgba(34,211,238,0.18)]"
                            >
                                <span className="absolute inset-0 overflow-hidden rounded-full">
                                    <span className="absolute inset-y-0 left-0 w-24 -translate-x-[180%] bg-linear-to-r from-transparent via-cyan-200/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ animation: 'notfound-sheen 1.8s linear infinite' }} />
                                </span>
                                <span className="relative z-10 inline-flex items-center gap-3">
                                    <span>RETURN TO ORBIT</span>
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                </span>
                            </a>

                            <div className="rounded-full border border-white/10 bg-white/4 px-4 py-3 text-xs tracking-[0.26em] text-slate-300/80">
                                THE EDGE OF THE MAP
                            </div>
                        </div>

                        <div className="mt-12 grid w-full gap-3 text-[10px] tracking-[0.34em] text-slate-500/90 sm:grid-cols-2">
                            <div className="rounded-full border border-white/8 bg-white/2 px-4 py-3 text-left">COORDINATES: UNKNOWN</div>
                            <div className="rounded-full border border-white/8 bg-white/2 px-4 py-3 text-right">BEACON SIGNAL: LOST</div>
                        </div>

                        <div className="mt-10 flex items-center gap-3 text-[10px] tracking-[0.34em] text-slate-500/90">
                            <span className="h-px w-10 bg-slate-500/50" />
                            <span>signal drift</span>
                            <span className="h-px w-10 bg-slate-500/50" />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
