'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function GameboyCursor() {
    const [isVisible, setIsVisible] = useState(false);
    const [isGrabbing, setIsGrabbing] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

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

        const handleMouseDown = () => setIsGrabbing(true);
        const handleMouseUp = () => setIsGrabbing(false);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveMouse);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseover', handleMouseOver);

        document.documentElement.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleMouseOver);
            document.documentElement.style.cursor = '';
        };
    }, [cursorX, cursorY, isVisible]);

    if (!isVisible) return null;

    const active = isGrabbing || isHovering;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999]"
            style={{ x: smX, y: smY, translateX: '-50%', translateY: '-50%' }}
        >
            <style dangerouslySetInnerHTML={{ __html: `* { cursor: none !important; }` }} />
            
            {/* Compact game machine cursor - 18×20px */}
            <svg
                width="18"
                height="20"
                viewBox="0 0 18 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Main body - compact rectangular device */}
                <rect
                    x="1"
                    y="1"
                    width="16"
                    height="18"
                    rx="2"
                    fill="#0f0f2e"
                    stroke="#00d4ff"
                    strokeWidth="0.8"
                />

                {/* Screen area - glowing game display */}
                <motion.rect
                    x="2"
                    y="2"
                    width="14"
                    height="8"
                    rx="1"
                    fill="#00d4ff"
                    opacity={active ? 0.3 : 0.1}
                    animate={{ opacity: active ? 0.4 : 0.15 }}
                    transition={{ duration: 0.2 }}
                />

                {/* Screen border */}
                <rect
                    x="2"
                    y="2"
                    width="14"
                    height="8"
                    rx="1"
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="0.5"
                    opacity="0.4"
                />

                {/* Tiny scanlines - game screen effect */}
                <line x1="2" y1="3.5" x2="16" y2="3.5" stroke="#00d4ff" strokeWidth="0.3" opacity="0.2" />
                <line x1="2" y1="5" x2="16" y2="5" stroke="#00d4ff" strokeWidth="0.3" opacity="0.2" />
                <line x1="2" y1="6.5" x2="16" y2="6.5" stroke="#00d4ff" strokeWidth="0.3" opacity="0.2" />

                {/* D-Pad (left) - minimal representation */}
                <circle cx="5" cy="14" r="1.5" fill="none" stroke="#00d4ff" strokeWidth="0.5" opacity="0.5" />
                <line x1="5" y1="12.8" x2="5" y2="13.2" stroke="#00d4ff" strokeWidth="0.4" opacity="0.6" />
                <line x1="3.8" y1="14" x2="6.2" y2="14" stroke="#00d4ff" strokeWidth="0.4" opacity="0.6" />

                {/* Action buttons (right) - indicator dots */}
                <motion.circle
                    cx="13"
                    cy="13.5"
                    r="0.8"
                    fill="#ff6b6b"
                    opacity={active ? 0.9 : 0.6}
                    animate={{ scale: active ? 1.2 : 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                />
                <circle cx="11" cy="14.5" r="0.8" fill="#ffd93d" opacity="0.6" />

                {/* Cursor pointer - directional accent */}
                <motion.polygon
                    points="9,18 7,16 9,16.5 11,16"
                    fill="#00d4ff"
                    opacity={active ? 0.8 : 0.4}
                    animate={{ opacity: active ? 0.9 : 0.5 }}
                    transition={{ duration: 0.2 }}
                />
            </svg>
        </motion.div>
    );
}
