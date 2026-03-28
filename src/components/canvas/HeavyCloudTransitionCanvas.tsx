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
                background: 'radial-gradient(ellipse at center, rgba(60,70,80,0.45) 0%, rgba(55,65,75,0.4) 25%, rgba(50,60,70,0.2) 50%, transparent 100%)',
                borderRadius: '50%',
                opacity: 0,
                filter: 'blur(80px)',
            }}
            initial={{ x: '-12%', y: 30, scale: 1.08, opacity: 0 }}
            animate={{ x: ['-12%', '34%', '56%'], y: [30, 6, -4], scale: [1.08, 1.02, 1], opacity: [0, opacity * 1.2, opacity, 0] }}
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
        <div className="w-full h-full overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #424f5c 0%, #3a464f 44%, #354859 100%)' }}>
            {/* 統一された霧レイヤー */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 150% 100% at 50% 50%, rgba(70,80,90,0.35) 0%, rgba(60,70,80,0.45) 40%, rgba(50,60,70,0.4) 100%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.0, 0.5, 0.45] }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* 細かい霧フィルム */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(106deg, rgba(60,70,80,0.15) 4%, rgba(65,75,85,0.25) 24%, rgba(55,65,75,0.2) 44%, rgba(50,60,70,0.1) 68%)', transform: 'translateX(10%) rotate(-16deg)', filter: 'blur(12px)' }}
                initial={{ opacity: 0, x: 82, y: -14 }}
                animate={{ opacity: [0, 0.45, 0.4], x: [82, 16, 0], y: [-14, -4, 0] }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* 深い霧の層 */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(50,60,70,0.35) 0%, rgba(55,65,75,0.2) 30%, rgba(50,60,70,0.3) 100%)' }}
                initial={{ opacity: 0.15 }}
                animate={{ opacity: [0.15, 0.35, 0.32] }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* 上部の厚い霧 */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    top: '-12%',
                    left: '-45%',
                    width: '190%',
                    height: '52%',
                    background: 'linear-gradient(180deg, rgba(55,65,75,0.55) 0%, rgba(60,70,80,0.5) 42%, rgba(70,80,90,0.15) 100%)',
                    filter: 'blur(18px)',
                }}
                initial={{ x: '18%', opacity: 0 }}
                animate={{ x: ['18%', '-10%', '-22%'], opacity: [0, 0.5, 0.45] }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* 下部の厚い霧 */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    bottom: '-14%',
                    left: '-38%',
                    width: '176%',
                    height: '48%',
                    background: 'linear-gradient(0deg, rgba(60,70,80,0.5) 0%, rgba(65,75,85,0.45) 46%, rgba(70,80,90,0.1) 100%)',
                    filter: 'blur(16px)',
                }}
                initial={{ x: '12%', opacity: 0 }}
                animate={{ x: ['12%', '-8%', '-18%'], opacity: [0, 0.48, 0.42] }}
                transition={{ duration: 1.3, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            />

            <CloudLayer delay={0.0} duration={1.3} offset="-8%" size="114vw" opacity={0.55} />
            <CloudLayer delay={0.06} duration={1.3} offset="16%" size="132vw" opacity={0.65} />
            <CloudLayer delay={0.1} duration={1.3} offset="36%" size="108vw" opacity={0.6} />
            <CloudLayer delay={0.14} duration={1.3} offset="58%" size="138vw" opacity={0.68} />
            <CloudLayer delay={0.08} duration={1.3} offset="78%" size="122vw" opacity={0.58} />
        </div>
    );
}
