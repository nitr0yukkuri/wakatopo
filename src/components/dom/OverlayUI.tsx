'use client'

import { motion } from 'framer-motion';

interface PlanetData {
    weather: string;
    contributions: number;
    activityLevel: number;
}

export default function OverlayUI({ data }: { data: PlanetData }) {
    return (
        <div className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between">
            {/* Header */}
            <header className="flex justify-between items-start">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    <h1 className="text-5xl font-bold tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        WAKATOPO
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]" />
                        <p className="text-sm text-cyan-100/80 uppercase tracking-widest font-medium">System Online</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                    className="text-right text-xs text-gray-300 border border-white/10 p-4 rounded-xl bg-black/40 backdrop-blur-xl shadow-2xl font-mono"
                >
                    <p className="mb-1 text-gray-500">LOC // OSAKA, JP</p>
                    <p className="mb-1">WTH // <span className="text-cyan-400">{data.weather.toUpperCase()}</span></p>
                    <p>ACT // {data.contributions} COMMITS</p>
                </motion.div>
            </header>

            {/* Footer */}
            <footer className="pointer-events-auto flex justify-between items-end">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                >
                    <div className="max-w-md text-sm text-gray-300 leading-relaxed bg-black/40 p-5 rounded-xl backdrop-blur-xl border border-white/10 border-l-4 border-l-cyan-500 shadow-2xl">
                        <p className="italic text-gray-400 mb-2">&quot;Code breathes with the atmosphere.&quot;</p>
                        <p>This planet evolves based on GitHub contributions and the real-world weather in Osaka.</p>
                    </div>
                </motion.div>

                {/* Interaction Hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="text-xs text-gray-500 tracking-widest uppercase"
                >
                    [ Drag to Rotate ]
                </motion.div>
            </footer>
        </div>
    );
}
