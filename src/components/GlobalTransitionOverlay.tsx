'use client';

import { useStore } from '@/store';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WarpEffectCanvas from '@/components/canvas/WarpEffectCanvas';
import CloudAscentCanvas from '@/components/canvas/CloudAscentCanvas';

export default function GlobalTransitionOverlay() {
    const transitionType = useStore((state) => state.transitionType);

    useEffect(() => {
        // トランジション中はスクロールを無効化
        if (transitionType !== 'none') {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
    }, [transitionType]);

    return (
        <AnimatePresence mode="wait">
            {transitionType === 'warp' && (
                <motion.div
                    key="warp"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[9999] pointer-events-auto bg-[#000000]"
                >
                    <WarpEffectCanvas />
                </motion.div>
            )}

            {transitionType === 'cloud' && (
                <motion.div
                    key="cloud"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[9999] pointer-events-auto bg-[#000000]"
                >
                    <CloudAscentCanvas />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
