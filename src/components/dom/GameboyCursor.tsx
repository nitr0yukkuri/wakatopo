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
            
            {/* Modern minimalist game device cursor - tilted 20deg for perspective */}
            <svg
                width="32"
                height="40"
                viewBox="0 0 32 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ 
                    transform: 'skewX(-15deg) rotateZ(20deg)',
                    transformOrigin: 'center center'
                }}
            >
                {/* Outer frame - elegant rectangle */}
                <rect
                    x="2"
                    y="2"
                    width="28"
                    height="32"
                    rx="4"
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="0.9"
                    opacity="0.7"
                />

                {/* Inner accent frame */}
                <rect
                    x="3.5"
                    y="3.5"
                    width="25"
                    height="29"
                    rx="3"
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="0.5"
                    opacity="0.3"
                />

                {/* Screen - subtle glow */}
                <motion.rect
                    x="5"
                    y="5"
                    width="22"
                    height="12"
                    rx="1"
                    fill="#00d4ff"
                    opacity={active ? 0.2 : 0.05}
                    animate={{ opacity: active ? 0.25 : 0.08 }}
                    transition={{ duration: 0.2 }}
                />

                {/* Minimal scanline accent */}
                <line x1="5" y1="10.5" x2="27" y2="10.5" stroke="#00d4ff" strokeWidth="0.4" opacity="0.15" />

                {/* Left control - geometric D-pad */}
                <g opacity={active ? 0.9 : 0.6}>
                    {/* Center circle */}
                    <circle cx="10" cy="24" r="1.8" fill="none" stroke="#00d4ff" strokeWidth="0.7" />
                    {/* Directional indicators */}
                    <line x1="10" y1="21.5" x2="10" y2="22.2" stroke="#00d4ff" strokeWidth="0.5" />
                    <line x1="10" y1="25.8" x2="10" y2="26.5" stroke="#00d4ff" strokeWidth="0.5" />
                    <line x1="7.5" y1="24" x2="8.2" y2="24" stroke="#00d4ff" strokeWidth="0.5" />
                    <line x1="11.8" y1="24" x2="12.5" y2="24" stroke="#00d4ff" strokeWidth="0.5" />
                </g>

                {/* Right control - action buttons */}
                <g>
                    {/* Button indicator dots */}
                    <motion.circle
                        cx="22"
                        cy="23"
                        r="1.2"
                        fill="none"
                        stroke="#ff6b6b"
                        strokeWidth="0.7"
                        opacity={active ? 0.95 : 0.65}
                        animate={{ r: active ? 1.4 : 1.2, opacity: active ? 1 : 0.65 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    />
                    <circle cx="18" cy="25.5" r="1.2" fill="none" stroke="#ffd93d" strokeWidth="0.7" opacity="0.65" />
                </g>

                {/* Bottom indicator - play pointer */}
                <motion.path
                    d="M 16 34 L 13 30 L 15.5 31.5 L 18 30 Z"
                    fill="#00d4ff"
                    opacity={active ? 0.85 : 0.45}
                    animate={{ opacity: active ? 0.9 : 0.5 }}
                    transition={{ duration: 0.2 }}
                />
            </svg>
        </motion.div>
    );
}
