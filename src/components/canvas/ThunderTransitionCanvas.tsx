'use client'

import { motion } from 'framer-motion';

// 雷のトランジション: 暗雲の露出変化と落雷の残光

function LightningBolt({ x, delay, scale = 1 }: { x: string; delay: number; scale?: number }) {
    return (
        <motion.svg
            className="absolute top-0 pointer-events-none"
            style={{ left: x, width: '6.5vw', minWidth: '22px', height: '100vh', filter: 'drop-shadow(0 0 7px rgba(255,255,255,0.8)) drop-shadow(0 0 14px rgba(158,203,255,0.52))', transformOrigin: 'top', scale }}
            viewBox="0 0 40 320"
            initial={{ opacity: 0, scaleY: 0.2 }}
            animate={{
                opacity: [0, 0, 1, 0.45, 0],
                scaleY: [0.2, 1, 1, 0.9, 0.9],
            }}
            transition={{
                duration: 1.2,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            <polyline
                points="20,0 12,56 22,112 10,172 20,236 12,280 18,320"
                fill="none"
                stroke="#d7ebff"
                strokeWidth="0.72"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <polyline
                points="22,112 28,146 20,182"
                fill="none"
                stroke="#e7f2ff"
                strokeWidth="0.28"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.72"
            />
            <polyline
                points="20,236 26,266 16,300"
                fill="none"
                stroke="#e7f2ff"
                strokeWidth="0.24"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.58"
            />
        </motion.svg>
    );
}

export default function ThunderTransitionCanvas() {
    return (
        <div
            className="w-full h-full overflow-hidden relative"
            style={{ background: 'linear-gradient(180deg, #070b12 0%, #0e1825 42%, #1a2839 100%)' }}
        >
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 90% 70% at 52% 18%, rgba(86,116,170,0.22) 0%, rgba(86,116,170,0.08) 36%, rgba(86,116,170,0) 72%)' }}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.12, 0.4, 0.18, 0.34, 0.16] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            <LightningBolt x="18%" delay={0.22} scale={0.9} />
            <LightningBolt x="54%" delay={0.58} scale={1.12} />
            <LightningBolt x="72%" delay={0.82} scale={0.82} />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(214,228,255,0.0) 0%, rgba(214,228,255,0.08) 46%, rgba(214,228,255,0.18) 100%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.2, 0.08, 0.16, 0.06] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
        </div>
    );
}
