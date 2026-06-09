'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type RainIntensity = 'default' | 'heavy';

const RAIN_TILT_DEGREES = 10;
const RAIN_FALL_DISTANCE_VH = 138;

const seededRandom = (index: number, salt: number) => {
    const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
};

const getPrefersLightRainMode = () => {
    if (typeof window === 'undefined') return false;

    const nav = navigator as Navigator & {
        connection?: { saveData?: boolean };
        deviceMemory?: number;
        standalone?: boolean;
    };

    const isStandalonePwa = window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
    const saveData = nav.connection?.saveData === true;
    const lowCore = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
    const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;

    return isStandalonePwa || saveData || lowCore || lowMemory;
};

export function RainParticles({ intensity = 'default' }: { intensity?: RainIntensity }) {
    const [isLightMode] = useState(getPrefersLightRainMode);

    const drops = useMemo(() => {
        const heavy = intensity === 'heavy';
        const count = heavy ? 180 : isLightMode ? 42 : 110;
        const baseDuration = heavy ? 0.82 : isLightMode ? 1.05 : 0.95;
        const maxDurationAdd = heavy ? 0.28 : isLightMode ? 0.35 : 0.45;
        const minHeight = heavy ? 12 : isLightMode ? 9 : 10;
        const maxHeightAdd = heavy ? 28 : isLightMode ? 14 : 22;
        const minOpacity = heavy ? 0.24 : isLightMode ? 0.14 : 0.16;
        const maxOpacityAdd = heavy ? 0.34 : isLightMode ? 0.18 : 0.28;
        const minDrift = heavy ? 6.6 : 6.2;
        const maxDriftAdd = heavy ? 1.9 : 2.4;
        const minWidth = heavy ? 1.2 : isLightMode ? 0.9 : 1;
        const maxWidthAdd = heavy ? 1.8 : isLightMode ? 0.8 : 1.2;

        return Array.from({ length: count }).map((_, i) => {
            const random = (salt: number) => seededRandom(i, salt + (heavy ? 100 : 0) + (isLightMode ? 200 : 0));

            return {
                id: i,
                left: `${random(1) * 100}%`,
                delay: random(2) * 1.2,
                duration: baseDuration + random(3) * maxDurationAdd,
                height: minHeight + random(4) * maxHeightAdd,
                opacity: minOpacity + random(5) * maxOpacityAdd,
                drift: minDrift + random(6) * maxDriftAdd,
                width: minWidth + random(7) * maxWidthAdd,
            };
        });
    }, [intensity, isLightMode]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
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
                        rotate: `${RAIN_TILT_DEGREES}deg`,
                        willChange: 'transform, opacity',
                    }}
                    initial={{ opacity: 0, y: '-8vh', x: 0 }}
                    animate={{
                        y: `${RAIN_FALL_DISTANCE_VH}vh`,
                        x: `${drop.drift}vh`,
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
            <RainParticles intensity="heavy" />
        </motion.div>
    );
}
