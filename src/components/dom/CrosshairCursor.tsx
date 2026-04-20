'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CrosshairCursor() {
    const [isVisible, setIsVisible] = useState(false);
    const [isGrabbing, setIsGrabbing] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Motion values for smooth transition
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
            // Check if hovering over standard clickable elements
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

        // Hide default cursor on this page
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

    // Active state drives the snapping and color change
    const active = isGrabbing || isHovering;

    return (
        <motion.div
            className="fixed top-0 left-0 w-12 h-12 pointer-events-none z-[9999] mix-blend-difference"
            style={{ x: smX, y: smY, translateX: '-50%', translateY: '-50%' }}
        >
            <style dangerouslySetInnerHTML={{ __html: `* { cursor: none !important; }` }} />
            <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Center Core Dot - Sharp and minimal */}
                <motion.div 
                    className="w-1 h-1 bg-white rounded-full"
                    animate={{ scale: active ? 1.8 : 1, opacity: active ? 1 : 0.8 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                />

                {/* Smooth Outer Orbital Ring */}
                <motion.div 
                    className="absolute inset-0 rounded-full border-[1px] border-white/20"
                    animate={{ 
                        rotate: 360,
                        scale: active ? 0.45 : 1,
                        borderColor: active ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'
                    }}
                    transition={{ 
                        rotate: { ease: "linear", duration: 16, repeat: Infinity },
                        scale: { type: 'spring', stiffness: 400, damping: 25 },
                        borderColor: { duration: 0.3 }
                    }}
                />
                
            </div>
        </motion.div>
    );
}
