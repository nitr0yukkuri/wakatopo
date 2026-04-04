'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

export function RainParticles() {
    const [mounted, setMounted] = useState(false);
    const [isLightMode, setIsLightMode] = useState(false);

    useEffect(() => {
        setMounted(true);

        const nav = navigator as Navigator & {
            connection?: { saveData?: boolean };
            deviceMemory?: number;
            standalone?: boolean;
        };

        const isStandalonePwa = window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
        const saveData = nav.connection?.saveData === true;
        const lowCore = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
        const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;

        setIsLightMode(isStandalonePwa || saveData || lowCore || lowMemory);
    }, []);

    if (!mounted) return null;

    const drops = useMemo(() => {
        const count = isLightMode ? 42 : 110;
        const baseDuration = isLightMode ? 1.05 : 0.95;
        const maxDurationAdd = isLightMode ? 0.35 : 0.45;
        const minHeight = isLightMode ? 9 : 10;
        const maxHeightAdd = isLightMode ? 14 : 22;
        const minOpacity = isLightMode ? 0.14 : 0.16;
        const maxOpacityAdd = isLightMode ? 0.18 : 0.28;
        const minDrift = isLightMode ? 20 : 26;
        const maxDriftAdd = isLightMode ? 40 : 64;
        const minWidth = isLightMode ? 0.9 : 1;
        const maxWidthAdd = isLightMode ? 0.8 : 1.2;

        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 1.2,
            duration: baseDuration + Math.random() * maxDurationAdd,
            height: minHeight + Math.random() * maxHeightAdd,
            opacity: minOpacity + Math.random() * maxOpacityAdd,
            drift: minDrift + Math.random() * maxDriftAdd,
            width: minWidth + Math.random() * maxWidthAdd,
        }));
    }, [isLightMode]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {drops.map((drop) => (
                <motion.div
                    key={drop.id}
                    className="absolute origin-top"
                    style={{
                        left: drop.left,
                        width: `${drop.width}px`,
                        height: `${drop.height}vh`,
                        top: '-24vh',
                        background: `linear-gradient(to bottom, rgba(240,247,255,0), rgba(220,235,255,${drop.opacity}), rgba(198,219,244,0))`,
                        filter: isLightMode ? 'none' : 'blur(0.3px)',
                        rotate: '10deg',
                        willChange: 'transform, opacity',
                    }}
                    initial={{ opacity: 0, y: '-8vh', x: 0 }}
                    animate={{
                        y: '138vh',
                        x: `${drop.drift}px`,
                        opacity: [0, drop.opacity, drop.opacity * 0.9, 0],
                    }}
                    transition={{
                        duration: drop.duration,
                        repeat: Infinity,
                        delay: drop.delay,
                        ease: 'linear'
                    }}
                />
            ))}
        </div>
    );
}

export default function RainTransitionCanvas() {
    return (
        <motion.div
            className="w-full h-full overflow-hidden relative"
            style={{ background: 'linear-gradient(180deg, #324c63 0%, #5b7892 42%, #91a9bd 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 90% 70% at 65% 12%, rgba(214,229,244,0.22) 0%, rgba(214,229,244,0.08) 34%, rgba(214,229,244,0) 70%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.06, 0.24, 0.18] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(110deg, rgba(220,232,244,0.0) 8%, rgba(220,232,244,0.14) 32%, rgba(214,228,244,0.06) 46%, rgba(214,228,244,0.0) 70%)', transform: 'translateX(4%) rotate(-10deg)', filter: 'blur(8px)' }}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: [0, 0.42, 0.28], x: [60, 10, 0] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(18,28,38,0.18) 0%, rgba(34,50,66,0.0) 26%, rgba(205,218,232,0.14) 100%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.34, 0.28] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <RainParticles />
        </motion.div>
    );
}
