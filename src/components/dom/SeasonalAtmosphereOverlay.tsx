'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SeasonEventType, SeasonType, WeatherType } from '@/store';
import {
    AUTUMN_BACKGROUND_GRADIENT,
    AUTUMN_LEAF_SPECS,
    autumnLeafStyle,
    FLOWER_CLOUDY_PETAL_SPECS,
    FIRST_LIGHT_ATMOSPHERE_GRADIENT,
    FIRST_LIGHT_BACKGROUND_GRADIENT,
    SPRING_PETAL_SPECS,
    SPRING_FLOWER_CLOUDY_BACKGROUND_GRADIENT,
    TSUYU_ATMOSPHERE_GRADIENT,
} from '@/lib/otenkigurashiSeasonal';
import { getWorldVisualProfile } from '@/lib/worldVisualProfile';

type SeasonalAtmosphereOverlayProps = {
    season: SeasonType;
    seasonEvent: SeasonEventType;
    weather: WeatherType;
    transitionDuration?: number;
};

export default function SeasonalAtmosphereOverlay({
    season,
    seasonEvent,
    weather,
    transitionDuration = 1.15,
}: SeasonalAtmosphereOverlayProps) {
    const {
        isClear,
        isGeshiEvent,
        showFirstLight,
        showBirthday,
        showSpring,
        showFlowerCloudy,
        showAutumn,
        showWinterSnow,
        showTsuyu,
    } = getWorldVisualProfile({ weather, season, seasonEvent });
    const springPetals = useMemo(() => SPRING_PETAL_SPECS, []);
    if (season === 'none' && !showBirthday) return null;

    const isGeshi = isGeshiEvent;

    const backgroundBySeason: Record<SeasonType, string> = {
        none: 'transparent',
        spring: showSpring
            ? 'radial-gradient(ellipse at 18% 12%, rgba(255,255,255,0.20), transparent 48%)'
            : showFlowerCloudy
                ? SPRING_FLOWER_CLOUDY_BACKGROUND_GRADIENT
                : 'transparent',
        summer: !isClear
            ? 'transparent'
            : isGeshi
                ? 'radial-gradient(ellipse at 82% 8%, rgba(181,224,243,0.18), transparent 48%), linear-gradient(180deg, rgba(160,211,235,0.08), transparent 62%)'
                : 'radial-gradient(ellipse at 82% 8%, rgba(255,220,115,0.42), transparent 48%), linear-gradient(180deg, rgba(255,201,79,0.12), transparent 62%)',
        autumn: showAutumn ? AUTUMN_BACKGROUND_GRADIENT : 'transparent',
        winter: showWinterSnow
            ? 'linear-gradient(110deg, rgba(193,228,249,0.28), transparent 34%, transparent 68%, rgba(175,215,242,0.24)), radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.34), transparent 65%)'
            : showFirstLight || showBirthday
                ? FIRST_LIGHT_BACKGROUND_GRADIENT
                : 'transparent',
    };

    return (
        <motion.div
            key={`season-atmosphere-${season}-${seasonEvent}`}
            className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden"
            style={{
                background: showTsuyu
                    ? TSUYU_ATMOSPHERE_GRADIENT
                    : showFirstLight || showBirthday
                        ? FIRST_LIGHT_ATMOSPHERE_GRADIENT
                        : backgroundBySeason[season],
                mixBlendMode: 'normal',
                boxShadow: showWinterSnow ? 'inset 0 0 80px rgba(199,230,249,0.36)' : undefined,
            }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{
                opacity: showTsuyu
                    ? [0.12, 0.24, 0.16]
                    : showFirstLight || showBirthday
                        ? [0.16, 0.30, 0.22]
                        : showAutumn
                            ? [0.34, 0.58, 0.44]
                            : showFlowerCloudy
                                ? [0.06, 0.14, 0.10]
                                : isGeshi
                                    ? [0.18, 0.36, 0.24]
                                    : [0.10, 0.20, 0.14],
                scale: [1.04, 1, 1.02],
            }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
        >
            {showTsuyu && (
                <>
                    <div
                        className="absolute inset-0"
                        style={{
                            background: weather === 'Clouds'
                                ? 'radial-gradient(ellipse at 50% 8%, rgba(215,224,236,0.18), transparent 54%), linear-gradient(180deg, rgba(113,139,175,0.10), rgba(121,101,151,0.06))'
                                : weather === 'Rain'
                                    ? 'radial-gradient(ellipse at 50% 35%, rgba(164,198,226,0.14), transparent 56%)'
                                    : 'radial-gradient(ellipse at 72% 12%, rgba(217,239,247,0.20), transparent 42%)',
                            opacity: 0.82,
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(105deg, transparent 0%, rgba(162,177,211,0.08) 48%, transparent 76%)',
                            filter: 'blur(12px)',
                            animation: 'otenki-transition-tsuyu-air 8s ease-in-out infinite alternate',
                        }}
                    />
                </>
            )}

            {showSpring && springPetals.map((petal, index) => (
                <span
                    key={`transition-sakura-petal-${index}`}
                    className="absolute rounded-[70%_30%_70%_30%]"
                    style={{
                        left: `${petal.left}%`,
                        top: '-8%',
                        width: petal.size,
                        height: petal.size * 0.62,
                        background: 'linear-gradient(135deg, rgba(255,249,252,0.94), rgba(244,153,191,0.76))',
                        boxShadow: '0 0 8px rgba(255,180,211,0.34)',
                        transform: `rotate(${petal.rotate}deg)`,
                        opacity: 0.74,
                        animation: `otenki-transition-sakura-fall ${petal.duration}s linear ${-petal.delay}s infinite`,
                        ['--transition-sakura-drift' as string]: `${petal.drift}px`,
                    }}
                />
            ))}
            {showFlowerCloudy && FLOWER_CLOUDY_PETAL_SPECS.map((petal, index) => (
                <span
                    key={`transition-flower-cloudy-petal-${index}`}
                    className="absolute rounded-[70%_30%_70%_30%]"
                    style={{
                        left: `${petal.left}%`,
                        top: '-8%',
                        width: petal.size * 0.82,
                        height: petal.size * 0.5,
                        background: 'linear-gradient(135deg, rgba(255,250,252,0.78), rgba(232,170,195,0.44))',
                        boxShadow: '0 0 6px rgba(248,193,214,0.16)',
                        transform: `rotate(${petal.rotate}deg)`,
                        opacity: 0.38,
                        animation: `otenki-transition-sakura-fall ${petal.duration}s linear ${-petal.delay}s infinite`,
                        ['--transition-sakura-drift' as string]: `${petal.drift}px`,
                    }}
                />
            ))}
            {showAutumn && AUTUMN_LEAF_SPECS.map((leaf, index) => (
                <span
                    key={`transition-momiji-leaf-${index}`}
                    className="absolute"
                    style={{ ...autumnLeafStyle(leaf), zIndex: 30 }}
                >
                    <span
                        className="absolute left-1/2 top-[14%] h-[72%] w-px -translate-x-1/2 rotate-[8deg] bg-amber-100/45"
                        aria-hidden="true"
                    />
                </span>
            ))}
            <style>{`
                @keyframes otenki-transition-sakura-fall {
                    0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
                    12% { opacity: 0.68; }
                    100% { transform: translate3d(var(--transition-sakura-drift), 112vh, 0) rotate(460deg); opacity: 0; }
                }
                @keyframes otenki-momiji-fall {
                    0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
                    12% { opacity: 0.86; }
                    100% { transform: translate3d(var(--autumn-drift), 112vh, 0) rotate(460deg); opacity: 0; }
                }
                @keyframes otenki-transition-tsuyu-air {
                    from { transform: translate3d(-1%, 0, 0) scale(1.02); opacity: 0.34; }
                    to { transform: translate3d(1%, 0.5%, 0) scale(1.06); opacity: 0.72; }
                }
            `}</style>
        </motion.div>
    );
}
