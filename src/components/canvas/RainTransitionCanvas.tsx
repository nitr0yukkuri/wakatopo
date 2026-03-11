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
            {drops.map((drop) => (
                <motion.div
                    key={drop.id}
                    className="absolute -top-12 w-[1px] h-12 bg-white/40"
                    style={{ left: drop.left }}
                    initial={{ opacity: 0 }}
                    animate={{ y: '120vh', opacity: [0, 1, 0.8, 0] }}
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
        <div className="w-full h-full bg-gradient-to-t from-[#60a5fa] to-[#bfdbfe]">
            <RainParticles />
        </div>
    );
}
