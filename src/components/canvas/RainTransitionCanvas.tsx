'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function RainParticles() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Use exactly the same logic as the original repository
    const drops = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 1.5,
        duration: 0.8 + Math.random() * 0.5
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {drops.map((drop) => {
                // Add variation to create depth
                const zDepth = Math.random();
                const isClose = zDepth > 0.7; // 30% are "close" to camera

                return (
                    <motion.div
                        key={drop.id}
                        className="absolute bg-white/40 origin-top"
                        style={{
                            left: drop.left,
                            width: isClose ? '2px' : '1px',
                            // Initial height
                            height: isClose ? '15vh' : '8vh',
                            top: '-20vh', // Start higher above screen
                        }}
                        initial={{ opacity: 0, y: 0, scaleY: 1, scaleX: 1 }}
                        animate={{
                            y: '140vh', // Fall further past screen
                            opacity: [0, 0.8, 1, 0],
                            // "Camera moving forward" effect: particles stretch and widen as they pass
                            scaleY: [1, 2, 3],
                            scaleX: [1, isClose ? 2 : 1, isClose ? 3 : 1]
                        }}
                        transition={{
                            // Much faster duration to simulate speed
                            duration: drop.duration * (isClose ? 0.3 : 0.4),
                            repeat: Infinity,
                            delay: drop.delay,
                            ease: 'linear'
                        }}
                    />
                );
            })}
        </div>
    );
}

export default function RainTransitionCanvas() {
    return (
        <motion.div
            className="w-full h-full bg-gradient-to-t from-[#60a5fa] to-[#bfdbfe]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
            <RainParticles />
        </motion.div>
    );
}
