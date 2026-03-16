'use client';

import { motion } from 'framer-motion';

// Night transition aligned with sunny style: layered atmosphere + rising moonlight.
export default function MoonriseTransitionCanvas() {
    return (
        <div
            className="w-full h-full pointer-events-none relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #000208 0%, #051024 44%, #0d213a 100%)' }}
        >
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 130% 96% at 50% 56%, rgba(0,0,0,0) 26%, rgba(0,0,0,0.26) 64%, rgba(0,0,0,0.5) 100%)' }}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.24, 0.44, 0.4] }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 86% 66% at 72% 14%, rgba(220,236,255,0.14) 0%, rgba(152,182,228,0.06) 34%, rgba(152,182,228,0) 72%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.02, 0.14, 0.1] }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute pointer-events-none"
                style={{
                    right: '-34%',
                    top: '-40%',
                    width: '190%',
                    height: '190%',
                    transform: 'rotate(-18deg)',
                    background: 'linear-gradient(104deg, rgba(210,226,255,0.0) 8%, rgba(186,208,244,0.14) 26%, rgba(138,170,220,0.06) 44%, rgba(106,142,198,0.0) 68%)',
                    filter: 'blur(10px)',
                    mixBlendMode: 'screen',
                }}
                initial={{ opacity: 0, x: 56, y: -30 }}
                animate={{ opacity: [0, 0.34, 0.24], x: [56, 10, 0], y: [-30, -8, 0] }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute pointer-events-none"
                style={{
                    right: '-30%',
                    top: '-36%',
                    width: '170%',
                    height: '175%',
                    transform: 'rotate(-18deg)',
                    background: 'linear-gradient(102deg, rgba(224,236,255,0.0) 12%, rgba(198,218,250,0.1) 30%, rgba(164,194,238,0.04) 46%, rgba(138,172,222,0.0) 66%)',
                    filter: 'blur(18px)',
                    mixBlendMode: 'screen',
                }}
                initial={{ opacity: 0, x: 34, y: -20 }}
                animate={{ opacity: [0, 0.22, 0.16], x: [34, 8, 0], y: [-20, -6, 0] }}
                transition={{ duration: 1.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    right: '8.6%',
                    top: '7%',
                    width: '122px',
                    height: '122px',
                    background: 'radial-gradient(circle, #f8fbff 0%, #dfeeff 34%, #b9d1ff 60%, #8db2ec 82%, rgba(128,164,222,0) 100%)',
                    boxShadow: '0 0 96px 32px rgba(156,194,252,0.34), 0 0 196px 112px rgba(90,130,198,0.22)',
                }}
                initial={{ y: 24, scale: 0.88, opacity: 0.08 }}
                animate={{ y: [24, 6, 0], scale: [0.88, 1.0, 1.0], opacity: [0.08, 0.62, 0.7] }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute rounded-full pointer-events-none border border-slate-100/40"
                style={{ right: '6.8%', top: '5.2%', width: '162px', height: '162px' }}
                initial={{ y: 30, scale: 0.8, opacity: 0 }}
                animate={{ y: [30, 8, 0], scale: [0.8, 1.0, 1.06], opacity: [0, 0.18, 0] }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(4,8,16,0.0) 0%, rgba(10,18,30,0.1) 40%, rgba(22,36,58,0.3) 100%)' }}
                initial={{ opacity: 0.04 }}
                animate={{ opacity: [0.08, 0.24, 0.2] }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            />
        </div>
    );
}
