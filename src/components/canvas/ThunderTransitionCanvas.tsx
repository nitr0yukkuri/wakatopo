'use client'

import { motion } from 'framer-motion';

// 雷のトランジション: 暗雲の露出変化と落雷の残光

function LightningBolt({ x, delay, scale = 1 }: { x: string; delay: number; scale?: number }) {
    return (
        <motion.svg
            className="absolute top-0 pointer-events-none"
            style={{ left: x, width: '10vw', minWidth: '34px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.95)) drop-shadow(0 0 22px rgba(158,203,255,0.8))', transformOrigin: 'top', scale }}
            viewBox="0 0 40 200"
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
                points="25,0 10,80 22,80 5,200 30,90 18,90 35,0"
                fill="#ffffff"
                stroke="#d7ebff"
                strokeWidth="1.2"
            />
        </motion.svg>
    );
}

export default function ThunderTransitionCanvas() {
    return (
        <div
            className="w-full h-full overflow-hidden relative"
            style={{ background: 'linear-gradient(180deg, #070b12 0%, #111927 42%, #223144 100%)' }}
        >
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 90% 70% at 52% 18%, rgba(86,116,170,0.22) 0%, rgba(86,116,170,0.08) 36%, rgba(86,116,170,0) 72%)' }}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.12, 0.4, 0.18, 0.34, 0.16] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(104deg, rgba(198,216,255,0.0) 10%, rgba(198,216,255,0.12) 28%, rgba(190,210,255,0.05) 46%, rgba(198,216,255,0.0) 66%)', transform: 'translateX(8%) rotate(-18deg)', filter: 'blur(12px)' }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: [0, 0.32, 0.18], x: [50, 10, 0] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'repeating-linear-gradient(168deg, rgba(210,220,240,0) 0 14px, rgba(176,192,218,0.14) 14px 16px, rgba(210,220,240,0) 16px 34px)', filter: 'blur(0.5px)' }}
                initial={{ opacity: 0.12, y: '-8%' }}
                animate={{ opacity: [0.12, 0.22, 0.14], y: ['-8%', '12%', '18%'] }}
                transition={{ duration: 1.2, ease: 'linear' }}
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
