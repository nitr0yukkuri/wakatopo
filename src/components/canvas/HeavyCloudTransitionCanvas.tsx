'use client'

import { motion } from 'framer-motion';

// 曇りの遷移: 晴れ系と同じテンポで、重い雲の層が空気ごと滑り込む

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
                left: '-34%',
                background: 'radial-gradient(ellipse at center, rgba(132,148,164,0.84) 0%, rgba(112,128,146,0.72) 38%, rgba(86,100,114,0.26) 62%, transparent 78%)',
                borderRadius: '50%',
                opacity: 0,
                filter: 'blur(44px)',
            }}
            initial={{ x: '-12%', y: 30, scale: 1.08, opacity: 0 }}
            animate={{ x: ['-12%', '34%', '56%'], y: [30, 6, -4], scale: [1.08, 1.02, 1], opacity: [0, opacity, opacity * 0.92, 0] }}
            transition={{
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        />
    );
}

export default function HeavyCloudTransitionCanvas() {
    return (
        <div className="w-full h-full overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #8ea0b1 0%, #b2c1cf 44%, #d6e1ea 100%)' }}>
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 92% 70% at 70% 14%, rgba(248,252,255,0.3) 0%, rgba(228,236,244,0.14) 36%, rgba(228,236,244,0) 72%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.08, 0.26, 0.2] }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(106deg, rgba(246,250,255,0.0) 4%, rgba(238,245,252,0.22) 24%, rgba(212,224,236,0.14) 44%, rgba(178,194,210,0.0) 68%)', transform: 'translateX(10%) rotate(-16deg)', filter: 'blur(12px)' }}
                initial={{ opacity: 0, x: 82, y: -14 }}
                animate={{ opacity: [0, 0.3, 0.24], x: [82, 16, 0], y: [-14, -4, 0] }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(86,102,118,0.08) 0%, rgba(126,144,162,0.0) 30%, rgba(104,124,142,0.2) 100%)' }}
                initial={{ opacity: 0.06 }}
                animate={{ opacity: [0.06, 0.2, 0.16] }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute pointer-events-none"
                style={{
                    top: '-12%',
                    left: '-45%',
                    width: '190%',
                    height: '52%',
                    background: 'linear-gradient(180deg, rgba(138,156,174,0.34) 0%, rgba(160,178,194,0.24) 42%, rgba(190,208,222,0.0) 100%)',
                    filter: 'blur(18px)',
                }}
                initial={{ x: '18%', opacity: 0 }}
                animate={{ x: ['18%', '-10%', '-22%'], opacity: [0, 0.38, 0.34] }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute pointer-events-none"
                style={{
                    bottom: '-14%',
                    left: '-38%',
                    width: '176%',
                    height: '48%',
                    background: 'linear-gradient(0deg, rgba(148,166,182,0.32) 0%, rgba(170,188,202,0.22) 46%, rgba(198,214,226,0.0) 100%)',
                    filter: 'blur(16px)',
                }}
                initial={{ x: '12%', opacity: 0 }}
                animate={{ x: ['12%', '-8%', '-18%'], opacity: [0, 0.34, 0.3] }}
                transition={{ duration: 1.3, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            />

            <CloudLayer delay={0.0} duration={1.3} offset="-8%" size="114vw" opacity={0.38} />
            <CloudLayer delay={0.06} duration={1.3} offset="16%" size="132vw" opacity={0.5} />
            <CloudLayer delay={0.1} duration={1.3} offset="36%" size="108vw" opacity={0.42} />
            <CloudLayer delay={0.14} duration={1.3} offset="58%" size="138vw" opacity={0.48} />
            <CloudLayer delay={0.08} duration={1.3} offset="78%" size="122vw" opacity={0.4} />
        </div>
    );
}
