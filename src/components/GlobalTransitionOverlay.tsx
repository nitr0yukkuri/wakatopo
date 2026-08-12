'use client';

import { useStore, type SeasonEventType, type SeasonType } from '@/store';
import { useEffect, useMemo } from 'react';
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

const seasonalValue = (index: number, salt: number) => {
    const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453123;
    return value - Math.floor(value);
};

function SeasonalTransitionAtmosphere({ season, seasonEvent }: { season: SeasonType; seasonEvent: SeasonEventType }) {
    const weather = useStore((state) => state.weather);
    const showAutumnLeaves = season === 'autumn' && (weather === 'Clear' || weather === 'Morning');
    const springPetals = useMemo(
        () => Array.from({ length: 18 }, (_, index) => ({
            left: seasonalValue(index, 21) * 100,
            delay: seasonalValue(index, 22) * 1.8,
            duration: 5.5 + seasonalValue(index, 23) * 3.5,
            size: 7 + seasonalValue(index, 24) * 7,
            drift: -42 + seasonalValue(index, 25) * 84,
            rotate: seasonalValue(index, 26) * 360,
        })),
        []
    );
    const autumnLeaves = useMemo(
        () => Array.from({ length: 18 }, (_, index) => ({
            left: seasonalValue(index, 31) * 100,
            duration: 9 + seasonalValue(index, 33) * 7,
            delay: -(seasonalValue(index, 32) * (9 + seasonalValue(index, 33) * 7)),
            size: 12 + seasonalValue(index, 34) * 9,
            drift: -34 + seasonalValue(index, 35) * 68,
            rotate: seasonalValue(index, 36) * 360,
            tone: seasonalValue(index, 37),
        })),
        []
    );

    if (season === 'none') return null;

    const isGeshi = season === 'summer' && seasonEvent === 'geshi';

    const backgroundBySeason: Record<SeasonType, string> = {
        none: 'transparent',
        spring: 'radial-gradient(ellipse at 18% 12%, rgba(255,255,255,0.20), transparent 48%)',
        summer: isGeshi
            ? 'radial-gradient(ellipse at 82% 8%, rgba(181,224,243,0.18), transparent 48%), linear-gradient(180deg, rgba(160,211,235,0.08), transparent 62%)'
            : 'radial-gradient(ellipse at 82% 8%, rgba(255,220,115,0.42), transparent 48%), linear-gradient(180deg, rgba(255,201,79,0.12), transparent 62%)',
        autumn: 'linear-gradient(180deg, #c7ded9 0%, #f1e6ce 50%, #e4b36f 100%)',
        winter: 'linear-gradient(110deg, rgba(193,228,249,0.28), transparent 34%, transparent 68%, rgba(175,215,242,0.24)), radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.34), transparent 65%)',
    };

    return (
        <motion.div
            key={`season-atmosphere-${season}-${seasonEvent}`}
            className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden"
            style={{
                background: backgroundBySeason[season],
                mixBlendMode: 'normal',
                boxShadow: season === 'winter' ? 'inset 0 0 80px rgba(199,230,249,0.36)' : undefined,
            }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{
                opacity: season === 'autumn'
                    ? [0.34, 0.58, 0.44]
                    : isGeshi
                        ? [0.18, 0.36, 0.24]
                        : [0.10, 0.20, 0.14],
                scale: [1.04, 1, 1.02],
            }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        >
            {season === 'spring' && springPetals.map((petal, index) => (
                <span
                    key={`transition-sakura-petal-${index}`}
                    className="absolute rounded-[70%_30%_70%_30%]"
                    style={{
                        left: `${petal.left}%`,
                        top: '-6%',
                        width: petal.size,
                        height: petal.size * 0.62,
                        background: 'linear-gradient(135deg, rgba(255,249,252,0.94), rgba(244,153,191,0.76))',
                        boxShadow: '0 0 8px rgba(255,180,211,0.34)',
                        transform: `rotate(${petal.rotate}deg)`,
                        opacity: 0.74,
                        animation: `otenki-transition-sakura-fall ${petal.duration}s linear ${petal.delay}s infinite`,
                        ['--transition-sakura-drift' as string]: `${petal.drift}px`,
                    }}
                />
            ))}
            {showAutumnLeaves && autumnLeaves.map((leaf, index) => (
                <span
                    key={`transition-momiji-leaf-${index}`}
                    className="absolute"
                    style={{
                        left: `${leaf.left}%`,
                        top: '-8%',
                        width: leaf.size,
                        height: leaf.size * 0.92,
                        clipPath: 'polygon(50% 2%, 57% 34%, 79% 20%, 67% 47%, 93% 48%, 68% 62%, 70% 91%, 51% 71%, 32% 93%, 34% 64%, 8% 69%, 31% 49%, 19% 25%, 43% 34%)',
                        background: 'linear-gradient(135deg, rgba(247,191,54,0.86), rgba(194,105,30,0.64))',
                        filter: 'drop-shadow(0 2px 3px rgba(105,55,29,0.16))',
                        transform: `rotate(${leaf.rotate}deg)`,
                        opacity: 0.92,
                        animation: `otenki-transition-momiji-fall ${leaf.duration}s linear ${leaf.delay}s infinite`,
                        ['--transition-momiji-drift' as string]: `${leaf.drift}px`,
                    }}
                />
            ))}
            <style>{`
                @keyframes otenki-transition-sakura-fall {
                    0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
                    14% { opacity: 0.74; }
                    100% { transform: translate3d(var(--transition-sakura-drift), 116vh, 0) rotate(420deg); opacity: 0; }
                }
                @keyframes otenki-transition-momiji-fall {
                    0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
                    12% { opacity: 0.86; }
                    100% { transform: translate3d(var(--transition-momiji-drift), 116vh, 0) rotate(400deg); opacity: 0; }
                }
            `}</style>
        </motion.div>
    );
}

export default function GlobalTransitionOverlay() {
    const { transitionType, season, seasonEvent, setTransitionType } = useStore();
    const isWeatherTransition = ['rain', 'snow', 'sunburst', 'flash', 'heavy-cloud', 'moonrise'].includes(transitionType);

    useEffect(() => {
        if (transitionType === 'none') return;

        // HMR or an interrupted route change can leave the overlay mounted.
        // The normal navigation timers finish sooner; this is only a safety net.
        const watchdog = window.setTimeout(() => setTransitionType('none'), 5000);
        return () => window.clearTimeout(watchdog);
    }, [setTransitionType, transitionType]);

    useEffect(() => {
        // トランジション中はスクロールを無効化
        if (transitionType !== 'none') {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
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
            {transitionType === 'freeze' && (
                <motion.div
                    key="freeze"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="fixed inset-0 z-[9999] pointer-events-none bg-[#020b16]"
                >
                    <FreezeTransitionCanvas />
                </motion.div>
            )}

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

            {isWeatherTransition && (
                <SeasonalTransitionAtmosphere season={season} seasonEvent={seasonEvent} />
            )}
        </AnimatePresence>
    );
}
