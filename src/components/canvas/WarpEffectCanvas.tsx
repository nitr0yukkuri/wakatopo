'use client'

import { motion } from 'framer-motion';

export default function WarpEffectCanvas() {
    const stars = [
        { x: '7%', y: '12%', s: 1.8, d: 0.0 },
        { x: '14%', y: '68%', s: 1.6, d: 0.06 },
        { x: '21%', y: '28%', s: 1.2, d: 0.12 },
        { x: '29%', y: '82%', s: 1.7, d: 0.08 },
        { x: '36%', y: '16%', s: 1.4, d: 0.14 },
        { x: '44%', y: '58%', s: 2.0, d: 0.03 },
        { x: '52%', y: '34%', s: 1.3, d: 0.16 },
        { x: '61%', y: '74%', s: 1.8, d: 0.1 },
        { x: '68%', y: '22%', s: 1.4, d: 0.18 },
        { x: '77%', y: '52%', s: 2.2, d: 0.04 },
        { x: '84%', y: '30%', s: 1.2, d: 0.2 },
        { x: '92%', y: '64%', s: 1.9, d: 0.07 },
    ];

    const comets = [
        { top: '22%', delay: 0.16, width: 220, rotate: -18 },
        { top: '63%', delay: 0.28, width: 180, rotate: -14 },
    ];

    return (
        <div className="relative w-full h-full overflow-hidden">
            <motion.div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 122% 92% at 50% 50%, #0b1428 0%, #060b19 56%, #020306 100%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1] }}
                transition={{ duration: 1.2, times: [0, 0.14, 1], ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 66% 48% at 50% 52%, rgba(86,128,210,0.2) 0%, rgba(42,72,138,0.1) 40%, rgba(10,18,34,0.0) 76%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.02, 0.18, 0.14] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 78% 56% at 42% 46%, rgba(136,110,242,0.16) 0%, rgba(86,94,224,0.08) 36%, rgba(22,22,66,0.0) 72%)',
                    mixBlendMode: 'screen',
                    filter: 'blur(12px)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.18, 0.1], x: ['-2%', '0%', '1%'], y: ['1%', '0%', '-1%'] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 72% 52% at 58% 58%, rgba(108,206,224,0.12) 0%, rgba(64,140,196,0.05) 38%, rgba(10,20,34,0.0) 76%)',
                    mixBlendMode: 'screen',
                    filter: 'blur(10px)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.14, 0.08], x: ['2%', '0%', '-1%'], y: ['-1%', '0%', '1%'] }}
                transition={{ duration: 1.2, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'conic-gradient(from 210deg at 50% 50%, rgba(122,92,226,0.0) 0deg, rgba(122,92,226,0.1) 66deg, rgba(86,178,232,0.07) 140deg, rgba(122,92,226,0.0) 240deg, rgba(122,92,226,0.0) 360deg)',
                    mixBlendMode: 'screen',
                    filter: 'blur(24px)',
                }}
                initial={{ opacity: 0, rotate: -6, scale: 1.02 }}
                animate={{ opacity: [0, 0.16, 0.08], rotate: [-6, 4, 12], scale: [1.02, 1.0, 0.98] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            {stars.map((star, idx) => (
                (() => {
                    const sx = parseFloat(star.x);
                    const sy = parseFloat(star.y);
                    const pullX = (50 - sx) * 0.42;
                    const pullY = (50 - sy) * 0.42;
                    return (
                <motion.div
                    key={`${star.x}-${star.y}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: star.x,
                        top: star.y,
                        width: `${star.s}px`,
                        height: `${star.s}px`,
                        background: 'rgba(226,236,255,0.9)',
                        boxShadow: `0 0 ${star.s * 4}px rgba(156,190,248,0.34)`,
                    }}
                    initial={{ opacity: 0, scale: 0.85, x: 0, y: 0 }}
                    animate={{
                        opacity: [0, 0.58, 0.52, 0.18],
                        scale: [0.82, 1.0, 1.12, 0.68],
                        x: ['0%', `${pullX * 0.45}%`, `${pullX * 0.9}%`, `${pullX * 1.28}%`],
                        y: ['0%', `${pullY * 0.45}%`, `${pullY * 0.9}%`, `${pullY * 1.28}%`],
                    }}
                    transition={{ duration: 1.35, delay: 0.04 + star.d, ease: [0.22, 1, 0.36, 1] }}
                />
                    );
                })()
            ))}

            {comets.map((comet, idx) => (
                <motion.div
                    key={`comet-${comet.top}`}
                    className="absolute h-px pointer-events-none"
                    style={{
                        top: comet.top,
                        left: '-26%',
                        width: `${comet.width}px`,
                        background: 'linear-gradient(90deg, rgba(170,206,255,0.0) 0%, rgba(198,220,255,0.44) 42%, rgba(238,246,255,0.0) 100%)',
                        transform: `rotate(${comet.rotate}deg)`,
                        filter: 'blur(0.6px) drop-shadow(0 0 8px rgba(146,186,255,0.28))',
                    }}
                    initial={{ x: '-10%', opacity: 0 }}
                    animate={{ x: '148%', opacity: [0, 0.54, 0] }}
                    transition={{ duration: 0.9, delay: comet.delay + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                />
            ))}

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 132% 100% at 50% 56%, rgba(0,0,0,0.0) 24%, rgba(0,0,0,0.24) 62%, rgba(0,0,0,0.56) 100%)',
                }}
                initial={{ opacity: 0.18 }}
                animate={{ opacity: [0.18, 0.3, 0.28] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute pointer-events-none rounded-full"
                style={{
                    left: '50%',
                    top: '50%',
                    width: '230px',
                    height: '230px',
                    marginLeft: '-115px',
                    marginTop: '-115px',
                    border: '1px solid rgba(176,198,246,0.22)',
                    boxShadow: '0 0 34px rgba(86,126,214,0.22), inset 0 0 24px rgba(108,162,236,0.12)',
                }}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: [0, 0.34, 0.16], scale: [1.08, 0.9, 0.82], rotate: [0, 18, 34] }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute pointer-events-none rounded-full"
                style={{
                    left: '50%',
                    top: '50%',
                    width: '300px',
                    height: '300px',
                    marginLeft: '-150px',
                    marginTop: '-150px',
                    border: '1px solid rgba(130,168,236,0.12)',
                    boxShadow: 'inset 0 0 30px rgba(94,130,208,0.08)',
                }}
                initial={{ opacity: 0, scale: 1.14, rotate: -12 }}
                animate={{ opacity: [0, 0.24, 0.08], scale: [1.14, 0.98, 0.84], rotate: [-12, 10, 28] }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute pointer-events-none rounded-full"
                style={{
                    left: '50%',
                    top: '50%',
                    width: '120px',
                    height: '120px',
                    marginLeft: '-60px',
                    marginTop: '-60px',
                    background: 'radial-gradient(circle, rgba(210,232,255,0.34) 0%, rgba(126,170,244,0.14) 44%, rgba(38,60,112,0.0) 100%)',
                    filter: 'blur(2px)',
                }}
                initial={{ opacity: 0, scale: 1.16 }}
                animate={{ opacity: [0, 0.5, 0.08], scale: [1.22, 0.8, 0.62] }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute pointer-events-none rounded-full"
                style={{
                    left: '50%',
                    top: '50%',
                    width: '40px',
                    height: '40px',
                    marginLeft: '-20px',
                    marginTop: '-20px',
                    background: 'radial-gradient(circle, rgba(228,242,255,0.86) 0%, rgba(156,194,252,0.36) 52%, rgba(70,108,182,0.0) 100%)',
                }}
                initial={{ opacity: 0, scale: 1.8 }}
                animate={{ opacity: [0, 0.9, 0.0], scale: [1.8, 0.8, 0.12] }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(180deg, rgba(10,16,30,0.0) 0%, rgba(20,28,58,0.08) 40%, rgba(16,24,46,0.16) 100%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.2, 0.14] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
        </div>
    );
}
