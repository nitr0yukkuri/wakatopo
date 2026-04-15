import { useEffect, useRef, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

const LONG_PRESS_MS = 180;
const TAP_MOVE_THRESHOLD = 12;
const ACTIVE_BURST_MS = 260;

const isDesktopLongPressMode = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024 && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
};

export const useCoreInteraction = () => {
    const [hovered, setHovered] = useState(false);
    const [active, setActive] = useState(false);

    const hitPointRef = useRef<THREE.Vector3 | null>(null);
    const tapStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
    const tapMovedRef = useRef(false);
    const activeBurstTimerRef = useRef<number | null>(null);
    const longPressTimerRef = useRef<number | null>(null);

    useEffect(() => {
        document.body.style.cursor = hovered ? (active ? 'crosshair' : 'pointer') : 'auto';

        const handlePointerUp = () => setActive(false);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            document.body.style.cursor = 'auto';
            window.removeEventListener('pointerup', handlePointerUp);

            if (activeBurstTimerRef.current !== null) {
                window.clearTimeout(activeBurstTimerRef.current);
                activeBurstTimerRef.current = null;
            }
            if (longPressTimerRef.current !== null) {
                window.clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
        };
    }, [hovered, active]);

    const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
    };

    const onPointerOut = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(false);
        setActive(false);
        hitPointRef.current = null;
        tapStartRef.current = null;
        tapMovedRef.current = false;

        if (longPressTimerRef.current !== null) {
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        tapStartRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
        tapMovedRef.current = false;

        if (!isDesktopLongPressMode()) {
            return;
        }

        if (longPressTimerRef.current !== null) {
            window.clearTimeout(longPressTimerRef.current);
        }

        longPressTimerRef.current = window.setTimeout(() => {
            if (!tapMovedRef.current) {
                setActive(true);
            }
            longPressTimerRef.current = null;
        }, LONG_PRESS_MS);
    };

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();

        if (longPressTimerRef.current !== null) {
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }

        if (isDesktopLongPressMode()) {
            tapStartRef.current = null;
            tapMovedRef.current = false;
            setActive(false);
            return;
        }

        const start = tapStartRef.current;
        if (!start || start.pointerId !== e.pointerId) {
            tapStartRef.current = null;
            tapMovedRef.current = false;
            return;
        }

        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        const moved = tapMovedRef.current || Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD;

        tapStartRef.current = null;
        tapMovedRef.current = false;
        if (moved) {
            setActive(false);
            return;
        }

        setActive(true);
        if (activeBurstTimerRef.current !== null) {
            window.clearTimeout(activeBurstTimerRef.current);
        }
        activeBurstTimerRef.current = window.setTimeout(() => {
            setActive(false);
            activeBurstTimerRef.current = null;
        }, ACTIVE_BURST_MS);
    };

    const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        hitPointRef.current = e.point;

        const start = tapStartRef.current;
        if (!start || start.pointerId !== e.pointerId) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD) {
            tapMovedRef.current = true;
            if (longPressTimerRef.current !== null) {
                window.clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
        }
    };

    const onPointerCancel = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        tapStartRef.current = null;
        tapMovedRef.current = false;
        setActive(false);
        if (longPressTimerRef.current !== null) {
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    return {
        hovered,
        active,
        hitPointRef,
        pointerHandlers: {
            onPointerOver,
            onPointerOut,
            onPointerDown,
            onPointerUp,
            onPointerMove,
            onPointerCancel,
        },
    };
};
