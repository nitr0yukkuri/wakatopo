'use client'

import { type SeasonEventType, type SeasonType, type WeatherType } from '@/store';
import { useMemo } from 'react';

const seasonalValue = (index: number, salt: number) => {
    const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453123;
    return value - Math.floor(value);
};

export default function OtenkiSeasonEffects({
    season,
    seasonEvent,
    weather,
}: {
    season: SeasonType;
    seasonEvent: SeasonEventType;
    weather: WeatherType;
}) {
    const isClear = weather === 'Clear' || weather === 'Morning';
    const showSpring = season === 'spring' && isClear;
    const showSummer = season === 'summer' && isClear;
    const showGeshi = showSummer && seasonEvent === 'geshi';
    const showAutumn = season === 'autumn';
    const showWinter = season === 'winter';
    const springPetals = useMemo(
        () => Array.from({ length: 24 }, (_, index) => ({
            left: seasonalValue(index, 1) * 100,
            // Keep a few petals on screen soon after the page opens while
            // preserving enough spread for a gentle, continuous fall.
            delay: seasonalValue(index, 2) * 4,
            duration: 12 + seasonalValue(index, 3) * 7,
            size: 7 + seasonalValue(index, 4) * 8,
            drift: -48 + seasonalValue(index, 5) * 96,
            rotate: seasonalValue(index, 6) * 360,
        })),
        []
    );
    const autumnLeaves = useMemo(
        () => Array.from({ length: 14 }, (_, index) => ({
            left: seasonalValue(index, 11) * 100,
            delay: seasonalValue(index, 12) * 8,
            duration: 12 + seasonalValue(index, 13) * 8,
            size: 9 + seasonalValue(index, 14) * 8,
            drift: -42 + seasonalValue(index, 15) * 84,
            rotate: seasonalValue(index, 16) * 360,
            tone: seasonalValue(index, 17),
        })),
        []
    );

    if (!showSpring && !showSummer && !showAutumn && !showWinter) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
            {showSpring && <div className="absolute inset-0 otenki-season-spring" />}

            {showSpring && springPetals.map((petal, index) => (
                <span
                    key={`otenki-sakura-petal-${index}`}
                    className="absolute rounded-[70%_30%_70%_30%]"
                    style={{
                        left: `${petal.left}%`,
                        top: '-8%',
                        width: petal.size,
                        height: petal.size * 0.62,
                        background: 'linear-gradient(135deg, rgba(255,247,251,0.92), rgba(244,153,191,0.72))',
                        boxShadow: '0 0 8px rgba(255,180,211,0.30)',
                        transform: `rotate(${petal.rotate}deg)`,
                        opacity: 0.68,
                        zIndex: 30,
                        animation: `otenki-sakura-fall ${petal.duration}s linear ${petal.delay}s infinite`,
                        ['--sakura-drift' as string]: `${petal.drift}px`,
                    }}
                />
            ))}

            {showAutumn && autumnLeaves.map((leaf, index) => (
                <span
                    key={`otenki-momiji-${index}`}
                    className="absolute"
                    style={{
                        left: `${leaf.left}%`,
                        top: '-8%',
                        width: leaf.size,
                        height: leaf.size * 0.72,
                        borderRadius: '70% 30% 70% 30%',
                        background: leaf.tone > 0.6
                            ? 'linear-gradient(135deg, rgba(220,121,48,0.82), rgba(150,76,31,0.52))'
                            : 'linear-gradient(135deg, rgba(236,178,67,0.78), rgba(184,104,38,0.50))',
                        transform: `rotate(${leaf.rotate}deg)`,
                        opacity: 0.54,
                        zIndex: 30,
                        animation: `otenki-autumn-fall ${leaf.duration}s linear ${leaf.delay}s infinite`,
                        ['--autumn-drift' as string]: `${leaf.drift}px`,
                    }}
                />
            ))}

            {showSummer && <div className="absolute inset-0 otenki-season-summer" />}

            {showGeshi && <div className="absolute inset-0 otenki-season-geshi" />}

            {showAutumn && <div className="absolute inset-0 otenki-season-autumn" />}

            {showWinter && <div className="absolute inset-0 otenki-season-winter" />}

            <style>{`
                .otenki-season-spring {
                    background:
                        radial-gradient(ellipse at 18% 8%, rgba(255,255,255,0.18) 0%, transparent 30%),
                        linear-gradient(155deg, rgba(255,255,255,0.04), transparent 58%);
                    mix-blend-mode: normal;
                    animation: otenki-spring-breeze 10s ease-in-out infinite alternate;
                }

                .otenki-season-summer {
                    background:
                        radial-gradient(ellipse at 84% 8%, rgba(255,220,108,0.62) 0%, rgba(255,192,69,0.24) 28%, transparent 54%),
                        repeating-linear-gradient(168deg, transparent 0 18px, rgba(255,235,158,0.10) 22px 24px, transparent 28px 44px),
                        linear-gradient(to bottom, rgba(255,211,107,0.24), transparent 68%);
                    mix-blend-mode: normal;
                    filter: blur(1px);
                    animation: otenki-heat-haze 5s ease-in-out infinite alternate;
                }

                .otenki-season-geshi {
                    background:
                        radial-gradient(circle at 82% 10%, rgba(255,237,148,0.30) 0%, transparent 34%),
                        linear-gradient(to bottom, rgba(255,245,193,0.13), transparent 58%);
                    animation: otenki-sun-breathe 4s ease-in-out infinite alternate;
                }

                .otenki-season-autumn {
                    background:
                        radial-gradient(ellipse at 12% 84%, rgba(224,133,47,0.44) 0%, transparent 42%),
                        linear-gradient(116deg, rgba(255,194,101,0.30), transparent 42%, rgba(104,47,30,0.24)),
                        radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(111,50,29,0.24) 100%);
                    mix-blend-mode: normal;
                    animation: otenki-autumn-light 12s ease-in-out infinite alternate;
                }

                .otenki-season-winter {
                    background:
                        linear-gradient(110deg, rgba(194,227,248,0.42), transparent 30%, transparent 70%, rgba(174,215,242,0.38)),
                        radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.72) 0%, rgba(235,247,255,0.34) 32%, transparent 68%),
                        linear-gradient(to bottom, rgba(183,219,244,0.28), rgba(236,248,255,0.30));
                    box-shadow: inset 0 0 72px rgba(187,222,244,0.34), inset 0 -20vh 15vh rgba(255,255,255,0.18);
                    animation: otenki-winter-frost 8s ease-in-out infinite alternate;
                }

                @keyframes otenki-spring-breeze {
                    from { transform: translate3d(-1.5%, 0, 0) scale(1.02); opacity: 0.68; }
                    to { transform: translate3d(1.5%, 1%, 0) scale(1.05); opacity: 0.92; }
                }

                @keyframes otenki-sakura-fall {
                    0% {
                        transform: translate3d(0, -10vh, 0) rotate(0deg);
                        opacity: 0;
                    }
                    12% { opacity: 0.68; }
                    100% {
                        transform: translate3d(var(--sakura-drift), 112vh, 0) rotate(460deg);
                        opacity: 0;
                    }
                }

                @keyframes otenki-autumn-fall {
                    0% {
                        transform: translate3d(0, -10vh, 0) rotate(0deg);
                        opacity: 0;
                    }
                    12% { opacity: 0.54; }
                    100% {
                        transform: translate3d(var(--autumn-drift), 112vh, 0) rotate(460deg);
                        opacity: 0;
                    }
                }

                @keyframes otenki-heat-haze {
                    from { transform: translate3d(-1%, 0, 0) scale(1.04); opacity: 0.55; }
                    to { transform: translate3d(1%, -1%, 0) scale(1.08); opacity: 0.88; }
                }

                @keyframes otenki-sun-breathe {
                    from { opacity: 0.58; transform: scale(1); }
                    to { opacity: 0.96; transform: scale(1.04); }
                }

                @keyframes otenki-autumn-light {
                    from { transform: translate3d(-1%, 1%, 0) scale(1.03); opacity: 0.68; }
                    to { transform: translate3d(1%, -1%, 0) scale(1.07); opacity: 0.92; }
                }

                @keyframes otenki-winter-frost {
                    from { opacity: 0.68; filter: saturate(0.92) brightness(1.02); }
                    to { opacity: 0.98; filter: saturate(0.78) brightness(1.10); }
                }
            `}</style>
        </div>
    );
}
