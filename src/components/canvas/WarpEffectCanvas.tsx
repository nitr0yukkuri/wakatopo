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

    const distantStars = [
        { x: '4%', y: '9%', o: 0.22 },
        { x: '11%', y: '35%', o: 0.2 },
        { x: '16%', y: '78%', o: 0.18 },
        { x: '24%', y: '18%', o: 0.26 },
        { x: '31%', y: '55%', o: 0.2 },
        { x: '37%', y: '88%', o: 0.24 },
        { x: '42%', y: '26%', o: 0.22 },
        { x: '48%', y: '67%', o: 0.2 },
        { x: '55%', y: '11%', o: 0.28 },
        { x: '62%', y: '41%', o: 0.2 },
        { x: '69%', y: '83%', o: 0.22 },
        { x: '74%', y: '21%', o: 0.24 },
        { x: '81%', y: '60%', o: 0.2 },
        { x: '88%', y: '14%', o: 0.26 },
        { x: '95%', y: '48%', o: 0.2 },
    ];

    const comets = [
        { top: '22%', delay: 0.16, width: 220, rotate: -18 },
        { top: '63%', delay: 0.28, width: 180, rotate: -14 },
        { top: '41%', delay: 0.22, width: 260, rotate: -20 },
    ];

    const warpStreaks = [
        { a: 8, l: 38, d: 0.0 },
        { a: 30, l: 28, d: 0.03 },
        { a: 52, l: 42, d: 0.05 },
        { a: 78, l: 32, d: 0.07 },
        { a: 104, l: 44, d: 0.09 },
        { a: 126, l: 30, d: 0.11 },
        { a: 150, l: 40, d: 0.13 },
        { a: 176, l: 34, d: 0.15 },
        { a: 202, l: 42, d: 0.17 },
        { a: 226, l: 30, d: 0.19 },
        { a: 250, l: 44, d: 0.21 },
        { a: 274, l: 32, d: 0.23 },
        { a: 302, l: 40, d: 0.25 },
        { a: 328, l: 30, d: 0.27 },
    ];

    return (
        <div className="relative w-full h-full overflow-hidden">
            <motion.div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 128% 96% at 50% 50%, #101a38 0%, #0a1230 42%, #050b1f 68%, #010205 100%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1] }}
                transition={{ duration: 1.2, times: [0, 0.14, 1], ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(116deg, rgba(132,108,236,0.0) 18%, rgba(132,108,236,0.2) 44%, rgba(96,170,228,0.26) 56%, rgba(132,108,236,0.0) 82%)',
                    mixBlendMode: 'screen',
                    filter: 'blur(20px)',
                }}
                initial={{ opacity: 0, x: '-2%', y: '1%' }}
                animate={{ opacity: [0, 0.34, 0.24], x: ['-2%', '0%', '1%'], y: ['1%', '0%', '-1%'] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
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
                    background: 'conic-gradient(from 196deg at 52% 49%, rgba(146,132,235,0.0) 0deg, rgba(146,132,235,0.2) 50deg, rgba(108,182,228,0.18) 122deg, rgba(146,132,235,0.0) 236deg, rgba(146,132,235,0.0) 360deg)',
                    mixBlendMode: 'screen',
                    filter: 'blur(24px)',
                }}
                initial={{ opacity: 0, rotate: -10, scale: 1.06 }}
                animate={{ opacity: [0, 0.28, 0.22], rotate: [-10, 8, 24], scale: [1.08, 1.0, 0.94] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'conic-gradient(from 14deg at 50% 52%, rgba(116,202,236,0.0) 0deg, rgba(116,202,236,0.14) 74deg, rgba(160,126,240,0.18) 142deg, rgba(116,202,236,0.0) 260deg, rgba(116,202,236,0.0) 360deg)',
                    mixBlendMode: 'screen',
                    filter: 'blur(26px)',
                }}
                initial={{ opacity: 0, rotate: -16, scale: 1.1 }}
                animate={{ opacity: [0, 0.22, 0.16], rotate: [-16, 6, 20], scale: [1.1, 1.0, 0.96] }}
                transition={{ duration: 1.2, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
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

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'repeating-radial-gradient(circle at 50% 50%, rgba(150,194,255,0.22) 0px, rgba(150,194,255,0.0) 12px, rgba(126,170,242,0.18) 22px, rgba(126,170,242,0.0) 34px)',
                    mixBlendMode: 'screen',
                    filter: 'blur(1px)',
                }}
                initial={{ opacity: 0, scale: 1.22 }}
                animate={{ opacity: [0, 0.22, 0.12], scale: [1.22, 0.94, 0.76] }}
                transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            />

            {warpStreaks.map((streak) => (
                <motion.div
                    key={`warp-streak-${streak.a}`}
                    className="absolute pointer-events-none"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: `${streak.l}px`,
                        height: '1px',
                        background: 'linear-gradient(90deg, rgba(190,220,255,0.92) 0%, rgba(142,198,255,0.42) 38%, rgba(118,174,242,0.0) 100%)',
                        transform: `translate(-50%, -50%) rotate(${streak.a}deg)`,
                        transformOrigin: '0% 50%',
                        filter: 'blur(0.4px) drop-shadow(0 0 6px rgba(132,188,255,0.45))',
                    }}
                    initial={{ opacity: 0, scaleX: 0.3 }}
                    animate={{ opacity: [0, 0.92, 0], scaleX: [0.3, 6.2, 12] }}
                    transition={{ duration: 0.95, delay: streak.d, ease: [0.22, 1, 0.36, 1] }}
                />
            ))}

            {warpStreaks.map((streak) => (
                <motion.div
                    key={`warp-streak-sub-${streak.a}`}
                    className="absolute pointer-events-none"
                    style={{
                        left: '50%',
                        top: '50%',
                        width: `${Math.round(streak.l * 0.72)}px`,
                        height: '1px',
                        background: 'linear-gradient(90deg, rgba(172,214,255,0.86) 0%, rgba(128,186,246,0.34) 42%, rgba(118,174,242,0.0) 100%)',
                        transform: `translate(-50%, -50%) rotate(${streak.a + 12}deg)`,
                        transformOrigin: '0% 50%',
                        filter: 'blur(0.3px) drop-shadow(0 0 5px rgba(138,194,255,0.38))',
                    }}
                    initial={{ opacity: 0, scaleX: 0.24 }}
                    animate={{ opacity: [0, 0.7, 0], scaleX: [0.24, 5.2, 10.2] }}
                    transition={{ duration: 0.92, delay: streak.d + 0.04, ease: [0.22, 1, 0.36, 1] }}
                />
            ))}

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

            {distantStars.map((star, idx) => (
                <motion.div
                    key={`distant-${star.x}-${star.y}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: star.x,
                        top: star.y,
                        width: '1px',
                        height: '1px',
                        background: 'rgba(226,236,255,0.9)',
                        boxShadow: '0 0 4px rgba(168,198,248,0.26)',
                    }}
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{
                        opacity: [0, star.o, star.o * 0.85, 0.1],
                        x: ['0%', `${(idx % 3) - 1}%`, `${((idx % 3) - 1) * 1.8}%`],
                        y: ['0%', `${(idx % 2 === 0 ? -1 : 1) * 0.8}%`, `${(idx % 2 === 0 ? -1 : 1) * 1.5}%`],
                    }}
                    transition={{ duration: 1.35, delay: 0.02 + idx * 0.015, ease: [0.22, 1, 0.36, 1] }}
                />
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
                className="absolute pointer-events-none rounded-full"
                style={{
                    left: '50%',
                    top: '50%',
                    width: '88px',
                    height: '88px',
                    marginLeft: '-44px',
                    marginTop: '-44px',
                    background: 'radial-gradient(circle, rgba(216,238,255,0.92) 0%, rgba(150,206,255,0.4) 46%, rgba(82,132,212,0.0) 100%)',
                    filter: 'blur(1px)',
                }}
                initial={{ opacity: 0, scale: 1.7 }}
                animate={{ opacity: [0, 0.7, 0], scale: [1.7, 0.9, 0.18] }}
                transition={{ duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
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
