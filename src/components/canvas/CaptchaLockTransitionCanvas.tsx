'use client';

import { motion } from 'framer-motion';

const GRID_CELLS = Array.from({ length: 9 }, (_, i) => i);
const HUD_BARS = [28, 47, 63, 78, 41, 85, 56];

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

                    <div className="mb-5 grid grid-cols-3 gap-2">
                        {GRID_CELLS.map((cell) => (
                            <motion.div
                                key={cell}
                                className="aspect-square rounded-md border border-cyan-100/15 bg-gradient-to-br from-slate-900/80 via-slate-800/45 to-slate-950/90"
                                animate={{ opacity: [0.4, 0.95, 0.45] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: cell * 0.045 }}
                            />
                        ))}
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
                </motion.div>
            </div>
        </div>
    );
}
