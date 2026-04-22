'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function GameboyCursor() {
    const [isVisible, setIsVisible] = useState(false);

    // Motion values for smooth tracking
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
    const smX = useSpring(cursorX, springConfig);
    const smY = useSpring(cursorY, springConfig);

    useEffect(() => {
        // Only show custom cursor on devices with fine pointer (mouse)
        if (window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        const moveMouse = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        window.addEventListener('mousemove', moveMouse);

        // Hide default cursor
        document.documentElement.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            document.documentElement.style.cursor = '';
        };
    }, [cursorX, cursorY, isVisible]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999]"
            style={{ x: smX, y: smY, translateX: '-50%', translateY: '-50%' }}
        >
            <style dangerouslySetInnerHTML={{ __html: `* { cursor: none !important; }` }} />
            
            {/* Gameboy-inspired portable game device SVG cursor */}
            <svg
                width="56"
                height="80"
                viewBox="0 0 56 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
            >
                {/* Main body */}
                <rect
                    x="4"
                    y="2"
                    width="48"
                    height="68"
                    rx="6"
                    fill="#1a1a2e"
                    stroke="#00d4ff"
                    strokeWidth="1.5"
                />

                {/* Screen bezel */}
                <rect
                    x="8"
                    y="8"
                    width="40"
                    height="32"
                    rx="3"
                    fill="#0a0f1f"
                    stroke="#00d4ff"
                    strokeWidth="1"
                />

                {/* Screen glow */}
                <rect
                    x="10"
                    y="10"
                    width="36"
                    height="28"
                    rx="2"
                    fill="#00d4ff"
                    opacity="0.15"
                />

                {/* Screen scanlines effect */}
                <defs>
                    <pattern
                        id="scanlines"
                        x="0"
                        y="0"
                        width="36"
                        height="2"
                        patternUnits="userSpaceOnUse"
                    >
                        <line
                            x1="0"
                            y1="0"
                            x2="36"
                            y2="0"
                            stroke="#00d4ff"
                            strokeWidth="0.5"
                            opacity="0.2"
                        />
                    </pattern>
                </defs>
                <rect
                    x="10"
                    y="10"
                    width="36"
                    height="28"
                    fill="url(#scanlines)"
                />

                {/* D-Pad (left side) */}
                <g>
                    {/* D-Pad background circle */}
                    <circle cx="18" cy="50" r="8" fill="#0a0a0a" stroke="#00d4ff" strokeWidth="1" />
                    
                    {/* D-Pad cross */}
                    <rect x="16" y="46" width="4" height="8" fill="#00d4ff" opacity="0.6" />
                    <rect x="14" y="48" width="8" height="4" fill="#00d4ff" opacity="0.6" />
                </g>

                {/* Action buttons (right side) */}
                <g>
                    {/* Button A */}
                    <circle cx="38" cy="54" r="3.5" fill="#ff6b6b" stroke="#ff6b6b" strokeWidth="0.5" opacity="0.8" />
                    
                    {/* Button B */}
                    <circle cx="30" cy="50" r="3.5" fill="#ffd93d" stroke="#ffd93d" strokeWidth="0.5" opacity="0.8" />
                </g>

                {/* Speaker grills */}
                <g>
                    <rect x="8" y="46" width="3" height="12" rx="1" fill="none" stroke="#00d4ff" strokeWidth="0.5" opacity="0.5" />
                    <rect x="12" y="46" width="3" height="12" rx="1" fill="none" stroke="#00d4ff" strokeWidth="0.5" opacity="0.5" />
                </g>

                {/* Bottom button area label */}
                <text
                    x="28"
                    y="72"
                    textAnchor="middle"
                    fontSize="6"
                    fill="#00d4ff"
                    opacity="0.6"
                    fontFamily="monospace"
                    fontWeight="bold"
                >
                    PLAY
                </text>
            </svg>
        </motion.div>
    );
}
