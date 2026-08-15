'use client'

import { type SeasonEventType, type SeasonType, type WeatherType } from '@/store';
import {
    AUTUMN_LEAF_SPECS,
    autumnLeafStyle,
    FLOWER_CLOUDY_PETAL_SPECS,
    FIRST_LIGHT_ATMOSPHERE_GRADIENT,
    SPRING_PETAL_SPECS,
    TSUYU_ATMOSPHERE_GRADIENT,
} from '@/lib/otenkigurashiSeasonal';
import { getWorldVisualProfile } from '@/lib/worldVisualProfile';
import { useMemo } from 'react';

export default function OtenkiSeasonEffects({
    season,
    seasonEvent,
    weather,
}: {
    season: SeasonType;
    seasonEvent: SeasonEventType;
    weather: WeatherType;
}) {
    const {
        showTsuyu,
        showFirstLight,
        showSpring,
        showFlowerCloudy,
        showGeshi,
        showSummer,
        showAutumn,
        showWinterSnow,
    } = getWorldVisualProfile({ weather, season, seasonEvent });
    const showWinter = showWinterSnow;
    const springPetals = useMemo(() => SPRING_PETAL_SPECS, []);
    if (!showTsuyu && !showFirstLight && !showSpring && !showFlowerCloudy && !showSummer && !showGeshi && !showAutumn && !showWinter) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
            {showTsuyu && (
                <>
                    <div data-testid="tsuyu-atmosphere" className="absolute inset-0 otenki-season-tsuyu" />
                    <div className={`absolute inset-0 otenki-season-tsuyu-${weather === 'Clouds' ? 'clouds' : weather === 'Rain' ? 'rain' : 'clear'}`} />
                </>
            )}

            {showSpring && <div className="absolute inset-0 otenki-season-spring" />}

            {showFlowerCloudy && <div className="absolute inset-0 otenki-season-flower-cloudy" />}

            {showFirstLight && <div data-testid="first-light-atmosphere" className="absolute inset-0 otenki-season-first-light" />}

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

            {showFlowerCloudy && FLOWER_CLOUDY_PETAL_SPECS.map((petal, index) => (
                <span
                    key={`otenki-flower-cloudy-petal-${index}`}
                    className="absolute rounded-[70%_30%_70%_30%]"
                    style={{
                        left: `${petal.left}%`,
                        top: '-8%',
                        width: petal.size * 0.82,
                        height: petal.size * 0.5,
                        background: 'linear-gradient(135deg, rgba(255,250,252,0.74), rgba(232,170,195,0.42))',
                        boxShadow: '0 0 6px rgba(248,193,214,0.16)',
                        transform: `rotate(${petal.rotate}deg)`,
                        opacity: 0.36,
                        zIndex: 30,
                        animation: `otenki-sakura-fall ${petal.duration}s linear ${petal.delay}s infinite`,
                        ['--sakura-drift' as string]: `${petal.drift}px`,
                    }}
                />
            ))}

            {showAutumn && AUTUMN_LEAF_SPECS.map((leaf, index) => (
                <span
                    key={`otenki-momiji-${index}`}
                    className="absolute"
                    style={{
                        ...autumnLeafStyle(leaf),
                        zIndex: 30,
                    }}
                >
                    <span
                        className="absolute left-1/2 top-[14%] h-[72%] w-px -translate-x-1/2 rotate-[8deg] bg-amber-100/45"
                        aria-hidden="true"
                    />
                </span>
            ))}

            {showAutumn && <div className="absolute inset-x-0 bottom-0 z-20 h-[14%] otenki-momiji-ground" />}

            {showSummer && <div className="absolute inset-0 otenki-season-summer" />}

            {showGeshi && (
                <>
                    <div className="absolute inset-0 otenki-season-geshi" />
                    <div className="absolute inset-0 otenki-season-geshi-rays" />
                    <div className="absolute inset-0 otenki-season-geshi-longday" />
                </>
            )}

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

                .otenki-season-tsuyu {
                    background: ${TSUYU_ATMOSPHERE_GRADIENT};
                    mix-blend-mode: normal;
                    opacity: 0.82;
                    animation: otenki-tsuyu-air 10s ease-in-out infinite alternate;
                }

                .otenki-season-tsuyu-clear {
                    background: radial-gradient(ellipse at 72% 12%, rgba(217,239,247,0.22), transparent 42%), linear-gradient(180deg, rgba(129,165,202,0.04), transparent 72%);
                    opacity: 0.70;
                }

                .otenki-season-tsuyu-clouds {
                    background: radial-gradient(ellipse at 50% 8%, rgba(210,220,232,0.20), transparent 54%), linear-gradient(180deg, rgba(113,139,175,0.12), rgba(121,101,151,0.06));
                    opacity: 0.82;
                }

                .otenki-season-tsuyu-rain {
                    background: radial-gradient(ellipse at 50% 35%, rgba(164,198,226,0.16), transparent 56%), repeating-linear-gradient(112deg, transparent 0 28px, rgba(180,205,229,0.035) 31px 33px, transparent 36px 66px);
                    opacity: 0.78;
                }

                .otenki-season-flower-cloudy {
                    background:
                        radial-gradient(ellipse at 18% 12%, rgba(255,255,255,0.22) 0%, transparent 38%),
                        linear-gradient(160deg, rgba(255,255,255,0.06), rgba(244,205,220,0.07) 68%, rgba(244,205,220,0.12));
                    mix-blend-mode: normal;
                    animation: otenki-flower-cloudy-haze 12s ease-in-out infinite alternate;
                }

                .otenki-season-first-light {
                    background: ${FIRST_LIGHT_ATMOSPHERE_GRADIENT};
                    animation: otenki-first-light-air 9s ease-in-out infinite alternate;
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
                        radial-gradient(circle at 82% 10%, rgba(202,231,236,0.16) 0%, rgba(170,215,226,0.035) 27%, transparent 40%),
                        linear-gradient(to bottom, rgba(238,239,216,0.055), transparent 58%);
                    animation: otenki-sun-breathe 4s ease-in-out infinite alternate;
                }

                .otenki-season-geshi-rays {
                    background: repeating-conic-gradient(
                        from 198deg at 82% 10%,
                        rgba(220,243,251,0.09) 0deg 3deg,
                        transparent 3deg 15deg
                    );
                    mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.72) 34%, transparent 76%);
                    mix-blend-mode: screen;
                    opacity: 0.24;
                    transform-origin: 82% 10%;
                    animation: otenki-geshi-rays 15s ease-in-out infinite alternate;
                }

                .otenki-season-geshi-longday {
                    background:
                        linear-gradient(174deg, rgba(219,242,251,0.07) 0%, transparent 32%),
                        radial-gradient(ellipse at 50% 100%, rgba(169,220,241,0.07) 0%, transparent 58%);
                    mix-blend-mode: soft-light;
                    opacity: 0.46;
                    animation: otenki-geshi-longday 11s ease-in-out infinite alternate;
                }

                .otenki-season-autumn {
                    background:
                        radial-gradient(ellipse at 12% 84%, rgba(232,155,61,0.24) 0%, transparent 42%),
                        linear-gradient(116deg, rgba(255,209,123,0.18), transparent 42%, rgba(150,93,61,0.08)),
                        radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(144,87,61,0.08) 100%);
                    mix-blend-mode: normal;
                    animation: otenki-autumn-light 12s ease-in-out infinite alternate;
                }

                .otenki-momiji-ground {
                    background:
                        radial-gradient(ellipse at 12% 100%, rgba(194,108,55,0.20) 0%, transparent 34%),
                        radial-gradient(ellipse at 52% 112%, rgba(235,168,61,0.24) 0%, transparent 44%),
                        linear-gradient(to top, rgba(161,98,57,0.10), transparent 72%);
                    filter: blur(1px);
                    opacity: 0.78;
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

                @keyframes otenki-tsuyu-air {
                    from { transform: translate3d(-0.5%, 0, 0) scale(1.02); opacity: 0.64; }
                    to { transform: translate3d(0.5%, 0.5%, 0) scale(1.05); opacity: 0.86; }
                }

                @keyframes otenki-flower-cloudy-haze {
                    from { transform: translate3d(-0.6%, 0, 0) scale(1.02); opacity: 0.66; }
                    to { transform: translate3d(0.6%, 0.5%, 0) scale(1.04); opacity: 0.86; }
                }

                @keyframes otenki-first-light-air {
                    from { transform: translate3d(-0.4%, 0, 0) scale(1.02); opacity: 0.56; }
                    to { transform: translate3d(0.4%, 0.4%, 0) scale(1.04); opacity: 0.78; }
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

                @keyframes otenki-momiji-fall {
                    0% {
                        transform: translate3d(0, -10vh, 0) rotate(0deg);
                        opacity: 0;
                    }
                    12% { opacity: 0.86; }
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
                    from { opacity: 0.46; transform: scale(1); }
                    to { opacity: 0.72; transform: scale(1.04); }
                }

                @keyframes otenki-geshi-rays {
                    from { transform: rotate(-1deg) scale(1.02); opacity: 0.16; }
                    to { transform: rotate(2deg) scale(1.08); opacity: 0.30; }
                }

                @keyframes otenki-geshi-longday {
                    from { transform: translate3d(-1%, 0, 0) scale(1.02); opacity: 0.32; }
                    to { transform: translate3d(1%, -0.5%, 0) scale(1.06); opacity: 0.52; }
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
