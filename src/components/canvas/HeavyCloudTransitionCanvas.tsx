'use client'

import { motion } from 'framer-motion';

// 曇り空の雲が画面を重く覆っていくトランジション
// CSS-only approach: animated gradient + cloud shapes

function CloudLayer({ delay, duration, offset, size, opacity }: {
    delay: number;
    duration: number;
    offset: string;
    size: string;
    opacity: number;
}) {
    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                width: size,
                height: size,
                top: offset,
                left: '-20%',
                background: 'radial-gradient(ellipse at center, #8a9ba8 0%, #7a8f9e 40%, transparent 70%)',
                borderRadius: '50%',
                opacity: 0,
                filter: 'blur(40px)',
            }}
            animate={{
                x: ['0%', '130%'],
                opacity: [0, opacity, opacity, 0],
            }}
            transition={{
                duration,
                delay,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 1,
            }}
        />
    );
}

export default function HeavyCloudTransitionCanvas() {
    return (
        <div className="w-full h-full overflow-hidden" style={{ background: 'linear-gradient(to bottom, #2c3e50, #4a5568, #718096)' }}>
            {/* 後ろの雲レイヤー */}
            <CloudLayer delay={0} duration={3} offset="5%" size="80vw" opacity={0.7} />
            <CloudLayer delay={0.3} duration={3.5} offset="20%" size="100vw" opacity={0.8} />
            <CloudLayer delay={0.1} duration={2.8} offset="40%" size="90vw" opacity={0.6} />
            <CloudLayer delay={0.5} duration={4} offset="60%" size="110vw" opacity={0.7} />
            <CloudLayer delay={0.2} duration={3.2} offset="75%" size="85vw" opacity={0.8} />
            <CloudLayer delay={0.4} duration={3.8} offset="90%" size="100vw" opacity={0.65} />

            {/* 手前の大きな雲レイヤー（より速く、より濃く） */}
            <CloudLayer delay={0.1} duration={2.2} offset="0%" size="130vw" opacity={0.5} />
            <CloudLayer delay={0.6} duration={2.5} offset="35%" size="120vw" opacity={0.6} />
            <CloudLayer delay={0.3} duration={2} offset="65%" size="140vw" opacity={0.5} />

            {/* 最前面：霧のような薄いオーバーレイ */}
            <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(40,50,60,0.4), rgba(60,70,80,0.6))' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0.8, 1] }}
                transition={{ duration: 2, ease: 'easeInOut' }}
            />

            {/* 中央のテキスト — 曇り天気の雰囲気 */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Cloudy</p>
            </motion.div>
        </div>
    );
}
