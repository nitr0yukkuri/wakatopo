'use client'

import { motion } from 'framer-motion';

// 晴れの遷移: 温かい陽光が放射状に広がって白熱する
// CSS+Framer Motion only

export default function SunburstTransitionCanvas() {
    const rays = Array.from({ length: 20 }, (_, i) => i);

    return (
        <div
            className="w-full h-full overflow-hidden relative flex items-center justify-center"
            style={{ background: 'linear-gradient(180deg, #8fd7ff 0%, #fff7dc 48%, #fffef6 100%)' }}
        >
            {/* 柔らかいオーラ層 */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 55% 40% at 50% 46%, rgba(255,214,132,0.38) 0%, rgba(255,214,132,0.12) 45%, rgba(255,214,132,0.0) 78%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.18, 0.42, 0.28] }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
            />

            {/* 放射状の光線 */}
            <div className="absolute inset-0 flex items-center justify-center">
                {rays.map((i) => (
                    <motion.div
                        key={i}
                        className="absolute pointer-events-none origin-bottom"
                        style={{
                            width: '2px',
                            height: '72vh',
                            background: 'linear-gradient(to top, rgba(255,231,165,0.82), rgba(255,207,115,0.34), transparent)',
                            bottom: '50%',
                            left: '50%',
                            marginLeft: '-1px',
                            rotate: `${(360 / 20) * i}deg`,
                            filter: 'blur(1.5px)',
                        }}
                        initial={{ scaleY: 0.2, opacity: 0 }}
                        animate={{ scaleY: [0.45, 1.02, 0.88], opacity: [0, 0.58, 0.34] }}
                        transition={{ duration: 1.25, delay: i * 0.03, ease: 'easeOut' }}
                    />
                ))}
            </div>

            {/* 太陽の中心（輝く円） */}
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: '96px',
                    height: '96px',
                    background: 'radial-gradient(circle, #fffdf7 18%, #ffe8a8 48%, #ffc96f 72%, rgba(255,200,0,0) 100%)',
                    boxShadow: '0 0 52px 20px rgba(255,222,132,0.42), 0 0 130px 84px rgba(255,196,98,0.18)',
                }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.6, 1.06, 1], opacity: [0, 0.9, 1] }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            />

            <motion.div
                className="absolute rounded-full pointer-events-none border border-amber-100/50"
                style={{ width: '152px', height: '152px' }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [0.9, 1.08, 1.14], opacity: [0, 0.26, 0] }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
            />

            {/* 全体の輝きオーバーレイ */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'white' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.08, 0.16, 0.34, 0.52] }}
                transition={{ duration: 2, ease: 'easeInOut' }}
            />

            {/* 中央テキスト */}
            <motion.div
                className="absolute inset-0 flex items-end justify-center pb-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 0.3, duration: 1.5, ease: 'easeInOut' }}
            >
                <p className="text-amber-600/60 font-mono text-xs tracking-widest uppercase">Sunny</p>
            </motion.div>
        </div>
    );
}
