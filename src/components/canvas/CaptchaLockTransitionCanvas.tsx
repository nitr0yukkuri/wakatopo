'use client';

import { motion } from 'framer-motion';

const GRID_CELLS = Array.from({ length: 9 }, (_, i) => i);
const HUD_BARS = [28, 47, 63, 78, 41, 85, 56];
const SELECT_SEQUENCE = [0, 3, 7] as const;
const SELECTED_CELLS = new Set<number>(SELECT_SEQUENCE);
const TARGET_LABEL = 'TRAFFIC LIGHT';
const TILE_IMAGES = [
    'https://raw.githubusercontent.com/nitr0yukkuri/recaptchgame/main/frontend/public/images/shingouki1.jpg',
    'https://raw.githubusercontent.com/nitr0yukkuri/recaptchgame/main/frontend/public/images/car2.jpg',
    'https://raw.githubusercontent.com/nitr0yukkuri/recaptchgame/main/frontend/public/images/kaidan1.jpg',
    'https://raw.githubusercontent.com/nitr0yukkuri/recaptchgame/main/frontend/public/images/shingouki3.jpg',
    'https://raw.githubusercontent.com/nitr0yukkuri/recaptchgame/main/frontend/public/images/shoukasen1.jpg',
    'https://raw.githubusercontent.com/nitr0yukkuri/recaptchgame/main/frontend/public/images/car4.jpg',
    'https://raw.githubusercontent.com/nitr0yukkuri/recaptchgame/main/frontend/public/images/kaidan2.jpg',
    'https://raw.githubusercontent.com/nitr0yukkuri/recaptchgame/main/frontend/public/images/shingouki4.jpg',
    'https://raw.githubusercontent.com/nitr0yukkuri/recaptchgame/main/frontend/public/images/shoukasen2.jpg',
];

export default function CaptchaLockTransitionCanvas() {
    return (
        <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_30%_25%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_82%_15%,rgba(59,130,246,0.24),transparent_32%),#02040b]">
            <div className="absolute inset-0 opacity-30 [background:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] [background-size:38px_38px]" />

            <motion.div
                className="absolute left-0 right-0 h-28 bg-gradient-to-b from-sky-300/25 via-cyan-200/10 to-transparent"
                initial={{ y: '-45%' }}
                animate={{ y: '130%' }}
                transition={{ duration: 1.15, ease: 'linear' }}
            />

            <motion.div
                className="absolute top-1/2 left-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
            />

            <div className="absolute inset-0 flex items-center justify-center px-6">
                <motion.div
                    initial={{ scale: 0.92, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="w-full max-w-2xl rounded-2xl border border-cyan-200/25 bg-[#071426]/88 p-5 shadow-[0_20px_80px_rgba(2,8,24,0.65)] md:p-7"
                >
                    <div className="mb-4 flex items-center justify-between text-[10px] font-mono tracking-[0.22em] text-cyan-100/80">
                        <span>RECAPTCHA GAME TRANSFER PROTOCOL</span>
                        <span className="inline-flex items-center gap-2 text-cyan-200">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                            SECURE LINK
                        </span>
                    </div>

                    <div className="mb-3 overflow-hidden rounded-md border border-[#4285f4]/45 bg-[#4285f4] text-white">
                        <div className="px-3 pt-2 pb-1 text-[10px] font-mono tracking-[0.18em] text-blue-100/95">Select all images with</div>
                        <div className="px-3 pb-2 text-lg font-black tracking-wide md:text-xl">{TARGET_LABEL}</div>
                    </div>

                    <div className="mb-5 grid grid-cols-3 gap-2">
                        {GRID_CELLS.map((cell) => {
                            const selected = SELECTED_CELLS.has(cell);
                            const selectionOrder = SELECT_SEQUENCE.indexOf(cell as (typeof SELECT_SEQUENCE)[number]);
                            return (
                                <motion.div
                                    key={cell}
                                    className="relative aspect-square overflow-hidden rounded-md border border-cyan-100/20 bg-slate-900/70"
                                    initial={{ opacity: 0.45, scale: 0.94 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.22, delay: 0.06 + cell * 0.03 }}
                                >
                                    <img
                                        src={TILE_IMAGES[cell]}
                                        alt="captcha tile"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/45" />

                                    {selected && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.45 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.44 + Math.max(selectionOrder, 0) * 0.14, duration: 0.2, ease: 'easeOut' }}
                                            className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 text-[12px] font-black text-white shadow-[0_0_16px_rgba(56,189,248,0.6)]"
                                        >
                                            ✓
                                        </motion.div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: selected ? [0, 0.25, 0] : 0 }}
                                        transition={{ delay: 0.45 + Math.max(selectionOrder, 0) * 0.14, duration: 0.32 }}
                                        className="pointer-events-none absolute inset-0 bg-cyan-200"
                                    />
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="mb-4 flex items-center justify-between rounded-md border border-[#3367d6]/50 bg-[#0c1d38]/80 px-3 py-2">
                        <span className="text-[11px] font-mono tracking-[0.14em] text-cyan-100/90">I&apos;m not a robot</span>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.85, duration: 0.2 }}
                            className="flex h-5 w-5 items-center justify-center rounded-sm border border-cyan-200/60 bg-cyan-300/15"
                        >
                            <span className="text-[12px] font-black text-cyan-100">✓</span>
                        </motion.div>
                    </div>

                    <div className="mb-4 flex items-center gap-3 rounded-lg border border-sky-200/20 bg-black/30 p-3">
                        <motion.div
                            className="flex h-5 w-5 items-center justify-center rounded-sm border border-cyan-200/50 bg-cyan-300/15"
                            animate={{ boxShadow: ['0 0 0 rgba(103,232,249,0)', '0 0 16px rgba(103,232,249,0.7)', '0 0 0 rgba(103,232,249,0)'] }}
                            transition={{ duration: 0.75, repeat: Infinity }}
                        >
                            <span className="h-2.5 w-2.5 rounded-[2px] bg-cyan-200" />
                        </motion.div>
                        <p className="text-xs font-mono tracking-[0.2em] text-cyan-100/90 md:text-sm">VERIFYING HUMAN INPUT...</p>
                    </div>

                    <div className="space-y-2">
                        {HUD_BARS.map((w, i) => (
                            <div key={w + i} className="h-1.5 rounded-full bg-cyan-950/70">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300"
                                    initial={{ width: `${Math.max(8, w - 26)}%` }}
                                    animate={{ width: `${w}%` }}
                                    transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                                />
                            </div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: [0, 1, 1], y: [8, 0, 0] }}
                        transition={{ duration: 0.5, delay: 0.95 }}
                        className="mt-4 flex items-center justify-between rounded-lg border border-emerald-300/35 bg-emerald-300/10 px-3 py-2 text-[11px] font-mono tracking-[0.18em] text-emerald-100"
                    >
                        <span>HUMAN VERIFIED</span>
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-300 text-[12px] font-black text-[#04210f]">✓</span>
                    </motion.div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1] }}
                transition={{ duration: 0.72, delay: 1.18, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(10,24,45,0.7),rgba(2,6,12,0.96))]"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 1.06, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 1.24, ease: 'easeOut' }}
                    className="flex flex-col items-center justify-center gap-5"
                >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-emerald-300/80 bg-emerald-300/15 text-5xl font-black text-emerald-200 shadow-[0_0_45px_rgba(74,222,128,0.45)] md:h-28 md:w-28 md:text-6xl">
                        ✓
                    </div>
                    <div className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-2 text-[11px] font-mono tracking-[0.2em] text-cyan-100/90">
                        SUCCESS - ENTERING MATCH
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
