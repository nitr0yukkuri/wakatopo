'use client';

import { useStore } from '@/store';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Lazy load all transition canvases — only loaded when triggered
const WarpEffectCanvas = dynamic(() => import('@/components/canvas/WarpEffectCanvas'), { ssr: false });
const CloudAscentCanvas = dynamic(() => import('@/components/canvas/CloudAscentCanvas'), { ssr: false });
const FreezeTransitionCanvas = dynamic(() => import('@/components/canvas/FreezeTransitionCanvas'), { ssr: false });
const RainTransitionCanvas = dynamic(() => import('@/components/canvas/RainTransitionCanvas'), { ssr: false });
const SnowTransitionCanvas = dynamic(() => import('@/components/canvas/SnowTransitionCanvas'), { ssr: false });
const HeavyCloudTransitionCanvas = dynamic(() => import('@/components/canvas/HeavyCloudTransitionCanvas'), { ssr: false });
const ThunderTransitionCanvas = dynamic(() => import('@/components/canvas/ThunderTransitionCanvas'), { ssr: false });
const SunburstTransitionCanvas = dynamic(() => import('@/components/canvas/SunburstTransitionCanvas'), { ssr: false });
const WaveTransitionCanvas = dynamic(() => import('@/components/canvas/WaveTransitionCanvas'), { ssr: false });
const MoonriseTransitionCanvas = dynamic(() => import('@/components/canvas/MoonriseTransitionCanvas'), { ssr: false });
const CaptchaLockTransitionCanvas = dynamic(() => import('@/components/canvas/CaptchaLockTransitionCanvas'), { ssr: false });

export default function GlobalTransitionOverlay() {
    const transitionType = useStore((state) => state.transitionType);

    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        const prevTouchAction = document.body.style.touchAction;

        // トランジション中はスクロールを無効化
        if (transitionType !== 'none') {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.touchAction = prevTouchAction;
        };
    }, [transitionType]);

    return (
        <AnimatePresence mode="wait">
            {transitionType === 'warp' && (
                <motion.div
                    key="warp"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.35 }}
                    className="fixed inset-0 z-9999 pointer-events-auto bg-[#000000]"
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
                    className="fixed inset-0 z-9999 pointer-events-auto bg-transparent"
                >
                    <CloudAscentCanvas />
                </motion.div>
            )}

            {/* Otenki Gurashi: Rain Transition */}
            {transitionType === 'rain' && (
                <motion.div
                    key="rain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="fixed inset-0 z-9999 pointer-events-auto bg-transparent"
                >
                    <RainTransitionCanvas />
                </motion.div>
            )}

            {/* Otenki Gurashi: Snow Transition */}
            {transitionType === 'snow' && (
                <motion.div
                    key="snow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="fixed inset-0 z-9999 pointer-events-auto bg-transparent"
                >
                    <SnowTransitionCanvas />
                </motion.div>
            )}

            {/* Otenki Gurashi: Sunburst (Clear/Morning) Transition */}
            {transitionType === 'sunburst' && (
                <motion.div
                    key="sunburst"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9 }}
                    className="fixed inset-0 z-9999 pointer-events-auto"
                >
                    <SunburstTransitionCanvas />
                </motion.div>
            )}

            {/* Otenki Gurashi: Flash (Thunder) Transition */}
            {transitionType === 'flash' && (
                <motion.div
                    key="flash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="fixed inset-0 z-9999 pointer-events-auto"
                >
                    <ThunderTransitionCanvas />
                </motion.div>
            )}

            {/* Otenki Gurashi: Heavy Cloud (Clouds) Transition */}
            {transitionType === 'heavy-cloud' && (
                <motion.div
                    key="heavy-cloud"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.3 }}
                    className="fixed inset-0 z-9999 pointer-events-auto"
                >
                    <HeavyCloudTransitionCanvas />
                </motion.div>
            )}

            {transitionType === 'wave' && (
                <motion.div
                    key="wave"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-9999 pointer-events-auto"
                >
                    <WaveTransitionCanvas />
                </motion.div>
            )}

            {/* Night Transition */}
            {transitionType === 'moonrise' && (
                <motion.div
                    key="moonrise"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.35 }}
                    className="fixed inset-0 z-9999 pointer-events-auto bg-[#010208]"
                >
                    <MoonriseTransitionCanvas />
                </motion.div>
            )}

            {/* Freeze Transition (ColdKeep) */}
            <div
                className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-700 bg-[#020b16] flex items-center justify-center ${transitionType === 'freeze' ? 'opacity-100' : 'opacity-0'
                    }`}
                style={{ visibility: transitionType === 'freeze' || transitionType === 'none' ? 'visible' : 'hidden' }}
            >
                {transitionType === 'freeze' && (
                    <div className="absolute inset-0">
                        <FreezeTransitionCanvas />
                    </div>
                )}
            </div>

            {transitionType === 'captcha-lock' && (
                <motion.div
                    key="captcha-lock"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1 }}
                    className="fixed inset-0 z-9999 pointer-events-auto bg-[#02040b]"
                >
                    <CaptchaLockTransitionCanvas />
                </motion.div>
            )}
        </AnimatePresence>
    );
}