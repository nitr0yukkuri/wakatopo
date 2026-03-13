'use client'

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 雷のトランジション: 暗い嵐の空に白い閃光が走る

function LightningBolt({ x, delay }: { x: string; delay: number }) {
    return (
        <motion.svg
            className="absolute top-0 pointer-events-none"
            style={{ left: x, width: '8vw', minWidth: '30px', filter: 'drop-shadow(0 0 8px #fff) drop-shadow(0 0 20px #a8d8ff)', transformOrigin: 'top' }}
            viewBox="0 0 40 200"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{
                opacity: [0, 1, 0.8, 0],
                scaleY: [0, 1, 1, 0],
            }}
            transition={{
                duration: 0.4,
                delay,
                ease: 'easeOut',
            }}
        >
            <polyline
                points="25,0 10,80 22,80 5,200 30,90 18,90 35,0"
                fill="#ffffff"
                stroke="#c8e8ff"
                strokeWidth="1"
            />
        </motion.svg>
    );
}

function FlashEffect({ onDone }: { onDone: () => void }) {
    return (
        <motion.div
            className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0, 0.5, 0] }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onAnimationComplete={onDone}
        />
    );
}

export default function ThunderTransitionCanvas() {
    const [flashVisible, setFlashVisible] = useState(false);
    const [flashCount, setFlashCount] = useState(0);

    useEffect(() => {
        // 連続した閃光エフェクト
        const timings = [200, 600, 1100, 1400];
        const timeouts = timings.map((t) =>
            setTimeout(() => {
                setFlashVisible(true);
                setFlashCount(c => c + 1);
            }, t)
        );
        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div
            className="w-full h-full overflow-hidden relative"
            style={{ background: 'linear-gradient(to bottom, #0d0d1a 0%, #1a1a2e 40%, #16213e 100%)' }}
        >
            {/* 雨のストライプ感（細い線） */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage: 'repeating-linear-gradient(175deg, transparent, transparent 2px, rgba(140,160,200,0.3) 2px, rgba(140,160,200,0.3) 4px)',
                    backgroundSize: '4px 60px',
                    animation: 'rain-fall 0.3s linear infinite',
                }}
            />

            {/* 雷ボルト */}
            <LightningBolt x="15%" delay={0.3} />
            <LightningBolt x="50%" delay={0.7} />
            <LightningBolt x="75%" delay={1.2} />
            <LightningBolt x="35%" delay={1.5} />

            {/* 閃光 */}
            <AnimatePresence>
                {flashVisible && (
                    <FlashEffect key={flashCount} onDone={() => setFlashVisible(false)} />
                )}
            </AnimatePresence>

            {/* 嵐の空 — グロウ */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(100,120,200,0.15), transparent 60%)' }}
                animate={{ opacity: [0, 1, 0.5, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* 中央のテキスト */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
            >
                <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Thunder</p>
            </motion.div>

            <style>{`
                @keyframes rain-fall {
                    from { background-position: 0 0; }
                    to { background-position: 4px 60px; }
                }
            `}</style>
        </div>
    );
}
