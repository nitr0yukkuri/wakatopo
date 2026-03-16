'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Flake = {
    id: number;
    left: string;
    size: number;
    delay: number;
    duration: number;
    drift: number;
    blur: number;
    opacity: number;
};

function SnowParticles() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const flakes: Flake[] = Array.from({ length: 95 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 6,
        delay: Math.random() * 1.1,
        duration: 3.8 + Math.random() * 2.2,
        drift: (Math.random() - 0.5) * 80,
        blur: Math.random() * 1.4,
        opacity: 0.35 + Math.random() * 0.4,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {flakes.map((flake) => (
                <motion.div
                    key={flake.id}
                    className="absolute rounded-full"
                    style={{
                        left: flake.left,
                        top: '-8vh',
                        width: `${flake.size}px`,
                        height: `${flake.size}px`,
                        background: `rgba(245,250,255,${flake.opacity})`,
                        boxShadow: `0 0 ${flake.size * 2.4}px rgba(235,244,255,${flake.opacity * 0.55})`,
                        filter: `blur(${flake.blur}px)`,
                    }}
                    initial={{ x: 0, y: '-8vh', opacity: 0 }}
                    animate={{
                        x: [0, flake.drift * 0.45, flake.drift],
                        y: ['-8vh', '54vh', '118vh'],
                        opacity: [0, flake.opacity, flake.opacity * 0.82, 0],
                    }}
                    transition={{
                        duration: flake.duration,
                        delay: flake.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
}

export default function SnowTransitionCanvas() {
    return (
        <motion.div
            className="w-full h-full overflow-hidden relative"
            style={{ background: 'linear-gradient(180deg, #6f8497 0%, #bac7d3 44%, #edf4f8 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 88% 68% at 50% 18%, rgba(255,255,255,0.28) 0%, rgba(244,249,255,0.12) 38%, rgba(244,249,255,0) 76%)' }}
                initial={{ opacity: 0.06 }}
                animate={{ opacity: [0.06, 0.26, 0.18] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(112deg, rgba(255,255,255,0.0) 10%, rgba(255,255,255,0.12) 28%, rgba(235,243,250,0.04) 46%, rgba(255,255,255,0.0) 66%)', transform: 'translateX(6%) rotate(-12deg)', filter: 'blur(10px)' }}
                initial={{ opacity: 0, x: 46 }}
                animate={{ opacity: [0, 0.3, 0.2], x: [46, 10, 0] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(116,134,150,0.16) 0%, rgba(225,235,243,0.0) 38%, rgba(255,255,255,0.18) 100%)' }}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.22, 0.2] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <SnowParticles />
        </motion.div>
    );
}
