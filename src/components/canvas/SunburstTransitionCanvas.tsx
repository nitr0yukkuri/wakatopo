'use client'

import { motion } from 'framer-motion';

// 晴れの遷移: 温かい陽光が放射状に広がって白熱する
// CSS+Framer Motion only

export default function SunburstTransitionCanvas() {
    const rays = Array.from({ length: 16 }, (_, i) => i);

    return (
        <div
            className="w-full h-full overflow-hidden relative flex items-center justify-center"
            style={{ background: 'linear-gradient(to bottom, #87CEEB, #fffde7)' }}
        >
            {/* 放射状の光線 */}
            <div className="absolute inset-0 flex items-center justify-center">
                {rays.map((i) => (
                    <motion.div
                        key={i}
                        className="absolute pointer-events-none origin-bottom"
                        style={{
                            width: '3px',
                            height: '65vh',
                            background: 'linear-gradient(to top, rgba(255,220,50,0.9), transparent)',
                            bottom: '50%',
                            left: '50%',
                            marginLeft: '-1.5px',
                            rotate: `${(360 / 16) * i}deg`,
                            filter: 'blur(2px)',
                        }}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: [0, 0.8, 0.6] }}
                        transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
                    />
                ))}
            </div>

            {/* 太陽の中心（輝く円） */}
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: '80px',
                    height: '80px',
                    background: 'radial-gradient(circle, #fff 30%, #ffe066 60%, rgba(255,200,0,0) 100%)',
                    boxShadow: '0 0 60px 30px rgba(255,220,50,0.5), 0 0 120px 80px rgba(255,200,0,0.2)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.6, ease: 'backOut' }}
            />

            {/* 全体の輝きオーバーレイ（クライマックスに白く飛ぶ） */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'white' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 0.3, 0.8, 1] }}
                transition={{ duration: 2, ease: 'easeIn' }}
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
